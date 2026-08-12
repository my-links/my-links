import User from '#models/user';
import AuditEvent from '#models/audit_event';
import type { RequestOrigin } from '#lib/request_origin';
import { AUDIT_JOURNAL_PAGE_SIZE } from '#constants/audit';
import { AUTH_EVENT_TYPE, type AuthEventType } from '#constants/auth';

export type AuthEventRecord = RequestOrigin & {
	readonly type: AuthEventType;
	readonly userId: number | null;
};

export type FailedLoginRecord = RequestOrigin & {
	readonly email: string;
};

/**
 * Something an administrator did to somebody else's account. Both identifiers
 * are required: an admin action written without its author reads as the owner
 * having done it, with the administrator's address attached to their name.
 */
export type AdminActionRecord = RequestOrigin & {
	readonly type: AuthEventType;
	readonly userId: number;
	readonly actorId: number;
};

export class AuthEventService {
	async record({
		type,
		userId,
		ip,
		userAgent,
	}: AuthEventRecord): Promise<void> {
		await AuditEvent.create({ type, userId, ip, userAgent });
	}

	/**
	 * The journal, newest first, one page at a time.
	 *
	 * Both accounts are preloaded because every line names them; reading them
	 * row by row would be two round trips per line rendered.
	 */
	listRecent(page: number) {
		return (
			AuditEvent.query()
				.whereNull('subjectType')
				.preload('user')
				.preload('actor')
				.orderBy('createdAt', 'desc')
				// Events written in the same transaction share a timestamp, so the
				// date alone does not order them and a page boundary would be free to
				// show the same row twice.
				.orderBy('id', 'desc')
				.paginate(page, AUDIT_JOURNAL_PAGE_SIZE)
		);
	}

	/**
	 * Journals what an administrator did to an account from the dashboard.
	 *
	 * The address and user agent are the administrator's, which is precisely
	 * why the row has to name them: attached to the target account alone they
	 * would describe a sign-in that never happened.
	 */
	async recordAdminAction(record: AdminActionRecord): Promise<void> {
		await AuditEvent.create(record);
	}

	/**
	 * Journals something an operator did from the console.
	 *
	 * No address and no user agent: there is no request, and inventing one
	 * would make an operator's own doing look like traffic. A row with neither
	 * is exactly what "this came from the machine itself" looks like in the
	 * journal.
	 */
	async recordConsoleAction(
		type: AuthEventType,
		userId: number
	): Promise<void> {
		await this.record({ type, userId, ip: null, userAgent: null });
	}

	/**
	 * Attributes a failed attempt to the account it targeted, when there is
	 * one. The lookup happens here rather than in the caller so the
	 * credentials service can keep refusing to say whether an account exists:
	 * the answer belongs in the journal, never in a response.
	 */
	async recordFailedLogin({
		email,
		ip,
		userAgent,
	}: FailedLoginRecord): Promise<void> {
		const targetedUser = await User.findBy('email', email);

		await this.record({
			type: AUTH_EVENT_TYPE.LOGIN_FAILED,
			userId: targetedUser?.id ?? null,
			ip,
			userAgent,
		});
	}
}
