import { DateTime } from 'luxon';
import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';

import User from '#models/user';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import { NO_REQUEST_ORIGIN } from '#lib/request_origin';
import type { RequestOrigin } from '#lib/request_origin';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { MailService } from '#services/mail/mail_service';
import { AccountAccessService } from '#services/auth/account_access_service';
import { ActivityEventService } from '#services/activity/activity_event_service';
import { AccountDeletionRequestedNotification } from '#mails/account_deletion_requested_notification';
import {
	ACCOUNT_DELETION_REASON,
	type AccountDeletionReason,
	ACCOUNT_DELETION_GRACE_PERIOD_DAYS,
} from '#constants/account';

export type RequestAccountDeletionOptions = {
	readonly origin?: RequestOrigin;
	readonly requestedByAdminId?: User['id'] | null;
	readonly reason?: AccountDeletionReason;
};

@inject()
export class AccountDeletionService {
	constructor(
		protected readonly activityEventService: ActivityEventService,
		protected readonly accountAccessService: AccountAccessService,
		protected readonly mailService: MailService
	) {}

	/**
	 * Starts the grace period instead of wiping outright: the row is marked
	 * disabled, not deleted, so a misclick — or an inactive account nobody
	 * meant to abandon — stays recoverable until either the owner logs back in
	 * and reactivates it, or `deleteUser` catches up with it once the grace
	 * period has run out.
	 *
	 * `requestedByAdminId` null means self-service or the inactivity sweep; set
	 * means which administrator requested it. That distinction is what the
	 * login gate reads back later: only a request that did not come from an
	 * administrator is something its own owner can undo by logging back in — an
	 * administrator's decision must not be reversible by the very account it
	 * targets. It also decides whether the confirmation mail goes out at all:
	 * warning someone that a moderation action is about to land, and how to
	 * stop it, would defeat the action.
	 *
	 * Every existing session and token is revoked here — a disabled account has
	 * no business staying reachable anywhere it was already signed in.
	 */
	async requestAccountDeletion(
		userId: User['id'],
		{
			origin = NO_REQUEST_ORIGIN,
			requestedByAdminId = null,
			reason = ACCOUNT_DELETION_REASON.SELF_REQUESTED,
		}: RequestAccountDeletionOptions = {}
	): Promise<void> {
		const user = await User.findOrFail(userId);

		await db.transaction(async (transaction) => {
			user.pendingDeletionAt = DateTime.now();
			user.pendingDeletionRequestedById = requestedByAdminId;
			await user.useTransaction(transaction).save();

			await this.activityEventService.record(
				{
					type: ACTIVITY_EVENT_TYPE.ACCOUNT_DELETION_REQUESTED,
					userId,
					origin,
					actorId: requestedByAdminId,
					subjectType: AUDIT_SUBJECT_TYPE.ACCOUNT,
					subjectId: userId,
				},
				transaction
			);
		});

		if (requestedByAdminId === null) {
			await this.mailService.send(
				new AccountDeletionRequestedNotification({
					user,
					reason,
					gracePeriodDays: ACCOUNT_DELETION_GRACE_PERIOD_DAYS,
				})
			);
		}

		await this.accountAccessService.revokeAllExcept(user, null);
	}

	/**
	 * Cancels a pending deletion. `reactivatedByAdminId` is null when the
	 * confirmation screen a self-service login mid-grace-period lands on is the
	 * caller — reaching here already proves the owner came back for it — and
	 * set when an administrator restores the account from the dashboard
	 * instead.
	 */
	async reactivateAccount(
		userId: User['id'],
		origin: RequestOrigin,
		reactivatedByAdminId: User['id'] | null = null
	): Promise<void> {
		const user = await User.findOrFail(userId);
		user.pendingDeletionAt = null;
		user.pendingDeletionRequestedById = null;
		await user.save();

		await this.activityEventService.record({
			type: ACTIVITY_EVENT_TYPE.ACCOUNT_REACTIVATED,
			userId,
			origin,
			actorId: reactivatedByAdminId,
			subjectType: AUDIT_SUBJECT_TYPE.ACCOUNT,
			subjectId: userId,
		});
	}

	/**
	 * Same grace period as self-service, started by an administrator instead —
	 * see `requestAccountDeletion`. An administrator account is never a valid
	 * target, the same protection `bulkDeleteUsers` used to enforce with an
	 * immediate wipe.
	 */
	async bulkRequestAccountDeletion(
		userIds: User['id'][],
		actorId: User['id'],
		origin: RequestOrigin
	): Promise<void> {
		const targetUsers = await User.query()
			.whereIn('id', userIds)
			.andWhere('isAdmin', false);

		for (const targetUser of targetUsers) {
			await this.requestAccountDeletion(targetUser.id, {
				origin,
				requestedByAdminId: actorId,
			});
		}
	}
}
