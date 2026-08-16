import { DateTime } from 'luxon';
import { inject } from '@adonisjs/core';
import { BaseCommand } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';

import User from '#models/user';
import { UserService } from '#services/user/user_service';
import {
	ACCOUNT_DELETION_REASON,
	ACCOUNT_INACTIVITY_THRESHOLD_DAYS,
} from '#constants/account';

/**
 * Meant to run from cron. Only starts the grace period — `account:prune-deleted`
 * still owns the actual wipe, and logging back in during it is exactly the
 * signal that an account was not really abandoned.
 *
 * An account already pending deletion, or belonging to an administrator, is
 * left alone: the first is already on the clock, the second is never a valid
 * target for an automatic action.
 */
export default class FlagInactiveAccounts extends BaseCommand {
	static commandName = 'account:flag-inactive';
	static description = `Start the deletion grace period for accounts inactive for ${ACCOUNT_INACTIVITY_THRESHOLD_DAYS} days`;
	static options: CommandOptions = { startApp: true };

	@inject()
	async run(userService: UserService): Promise<void> {
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
			await userService.requestAccountDeletion(account.id, {
				reason: ACCOUNT_DELETION_REASON.INACTIVITY,
			});
		}

		this.logger.success(
			`Flagged ${inactiveAccounts.length} inactive account(s) for deletion`
		);
	}
}
