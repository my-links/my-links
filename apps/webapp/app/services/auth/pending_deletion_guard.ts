import { inject } from '@adonisjs/core';
import type { Session } from '@adonisjs/session';

import { AUTH_EVENT_TYPE } from '#constants/auth';
import type { RequestOrigin } from '#lib/request_origin';
import type User from '#models/user';
import { AccountReactivationService } from '#services/auth/account_reactivation_service';
import { AuthEventService } from '#services/auth/auth_event_service';

export const PENDING_DELETION_OUTCOME = {
	PROCEED: 'proceed',
	REACTIVATION_REQUIRED: 'reactivation_required',
	BLOCKED_BY_ADMIN: 'blocked_by_admin',
} as const;

export type PendingDeletionOutcome =
	(typeof PENDING_DELETION_OUTCOME)[keyof typeof PENDING_DELETION_OUTCOME];

/**
 * The decision every sign-in method takes once it has proven who is asking and
 * before it opens a session. Each caller maps the outcome onto its own
 * response, so a refusal looks the same as any other failed attempt of that
 * method.
 */
@inject()
export class PendingDeletionGuard {
	constructor(
		protected readonly authEventService: AuthEventService,
		protected readonly accountReactivationService: AccountReactivationService
	) {}

	/**
	 * A disabled account only reveals itself once the credential that unlocks it
	 * has already been proven right.
	 *
	 * An administrator's deletion is never reversible by signing back in:
	 * offering the reactivation screen would let the very account it targets
	 * undo the decision. The caller answers `BLOCKED_BY_ADMIN` exactly like a
	 * failed attempt: same message, same journal shape, nothing that tells the
	 * visitor the account exists at all, let alone why it is unreachable.
	 */
	async evaluate(
		user: User,
		session: Session,
		origin: RequestOrigin
	): Promise<PendingDeletionOutcome> {
		if (!user.pendingDeletionAt) {
			return PENDING_DELETION_OUTCOME.PROCEED;
		}

		if (user.pendingDeletionRequestedById) {
			await this.authEventService.record({
				type: AUTH_EVENT_TYPE.LOGIN_BLOCKED_ADMIN_DELETION,
				userId: user.id,
				...origin,
			});

			return PENDING_DELETION_OUTCOME.BLOCKED_BY_ADMIN;
		}

		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.LOGIN_BLOCKED_PENDING_DELETION,
			userId: user.id,
			...origin,
		});
		this.accountReactivationService.armPendingConfirmation(session, user);

		return PENDING_DELETION_OUTCOME.REACTIVATION_REQUIRED;
	}
}
