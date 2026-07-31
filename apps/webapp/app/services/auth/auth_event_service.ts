import User from '#models/user';
import AuthEvent from '#models/auth_event';
import { AUTH_EVENT_TYPE, type AuthEventType } from '#constants/auth';

/**
 * Where an authentication event came from. Both fields are nullable because a
 * request behind a misconfigured proxy, or one sent by a client that omits a
 * user agent, still has to be journaled.
 */
export type AuthEventOrigin = {
	readonly ip: string | null;
	readonly userAgent: string | null;
};

export type AuthEventRecord = AuthEventOrigin & {
	readonly type: AuthEventType;
	readonly userId: number | null;
};

export type FailedLoginRecord = AuthEventOrigin & {
	readonly email: string;
};

export class AuthEventService {
	async record({
		type,
		userId,
		ip,
		userAgent,
	}: AuthEventRecord): Promise<void> {
		await AuthEvent.create({ type, userId, ip, userAgent });
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
