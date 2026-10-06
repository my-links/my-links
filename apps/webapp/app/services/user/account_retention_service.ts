import { DateTime } from 'luxon';
import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import User from '#models/user';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import { NO_REQUEST_ORIGIN } from '#lib/request_origin';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { AccountDeletionService } from '#services/user/account_deletion_service';
import { ActivityEventService } from '#services/activity/activity_event_service';
import {
	ACCOUNT_DELETION_REASON,
	ACCOUNT_DELETION_GRACE_PERIOD_DAYS,
	ACCOUNT_INACTIVITY_THRESHOLD_DAYS,
} from '#constants/account';

@inject()
export class AccountRetentionService {
	constructor(
		protected readonly activityEventService: ActivityEventService,
		protected readonly accountDeletionService: AccountDeletionService
	) {}

	/**
	 * Starts the grace period for every account inactive for
	 * `ACCOUNT_INACTIVITY_THRESHOLD_DAYS`. An account already pending
	 * deletion, or belonging to an administrator, is left alone: the first is
	 * already on the clock, the second is never a valid target for an
	 * automatic action.
	 *
	 * Meant to run on a schedule — see `start/scheduler.ts` and
	 * `commands/flag_inactive_accounts.ts`.
	 */
	async flagInactiveAccounts(): Promise<number> {
		const cutoff = DateTime.now()
			.minus({ days: ACCOUNT_INACTIVITY_THRESHOLD_DAYS })
			.toSQL();

		const inactiveAccounts = await User.query()
			.where('isAdmin', false)
			.whereNull('pendingDeletionAt')
			.where((query) => {
				query
					.where((seen) =>
						seen.whereNotNull('lastSeenAt').andWhere('lastSeenAt', '<', cutoff)
					)
					.orWhere((neverSeen) =>
						neverSeen.whereNull('lastSeenAt').andWhere('createdAt', '<', cutoff)
					);
			});

		for (const account of inactiveAccounts) {
			await this.accountDeletionService.requestAccountDeletion(account.id, {
				reason: ACCOUNT_DELETION_REASON.INACTIVITY,
			});
		}

		return inactiveAccounts.length;
	}

	/**
	 * Wipes an account's own data, self-service (no actor). The activity row is
	 * written before the delete, not after: `audit_events.user_id` references
	 * `users`, so a row naming a user has to be inserted while that user still
	 * exists. `ON DELETE SET NULL` then takes over — the row survives the
	 * cascade and simply loses the name, exactly as it does for every other
	 * account event.
	 */
	async deleteUser(userId: User['id']): Promise<void> {
		await db.transaction(async (transaction) => {
			const dataCounts = await this.countUserData(userId, transaction);

			await this.activityEventService.record(
				{
					type: ACTIVITY_EVENT_TYPE.ACCOUNT_DATA_WIPED,
					userId,
					origin: NO_REQUEST_ORIGIN,
					subjectType: AUDIT_SUBJECT_TYPE.ACCOUNT,
					subjectId: userId,
					metadata: dataCounts,
				},
				transaction
			);

			await User.query({ client: transaction }).where('id', userId).delete();
		});
	}

	/**
	 * Wipes every account whose grace period ran out — `deleteUser` unchanged,
	 * the same self-service wipe a login-time cancellation would otherwise
	 * have pre-empted.
	 *
	 * Meant to run on a schedule — see `start/scheduler.ts` and
	 * `commands/prune_deleted_accounts.ts`.
	 */
	async pruneExpiredDeletions(): Promise<number> {
		const cutoff = DateTime.now().minus({
			days: ACCOUNT_DELETION_GRACE_PERIOD_DAYS,
		});

		const expiredAccounts = await User.query()
			.whereNotNull('pendingDeletionAt')
			.andWhere('pendingDeletionAt', '<', cutoff.toSQL());

		for (const account of expiredAccounts) {
			await this.deleteUser(account.id);
		}

		return expiredAccounts.length;
	}

	private async countUserData(
		userId: User['id'],
		client: TransactionClientContract
	): Promise<{ collections: number; links: number }> {
		const [{ total: collectionsTotal }] = await client
			.from('collections')
			.where('author_id', userId)
			.count('* as total');
		const [{ total: linksTotal }] = await client
			.from('links')
			.where('author_id', userId)
			.count('* as total');

		return {
			collections: Number(collectionsTotal),
			links: Number(linksTotal),
		};
	}
}
