import { DateTime } from 'luxon';
import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import User from '#models/user';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { MailService } from '#services/mail/mail_service';
import { AUTH_EVENT_TYPE, type AuthProvider } from '#constants/auth';
import { ACCOUNT_DELETION_GRACE_PERIOD_DAYS } from '#constants/account';
import { AccountAccessService } from '#services/auth/account_access_service';
import { ActivityEventService } from '#services/activity/activity_event_service';
import LastAdministratorException from '#exceptions/admin/last_administrator_exception';
import AccountDeletionRequestedNotification from '#mails/account_deletion_requested_notification';

/**
 * Narrows a listing to a subset of the accounts. Every field is stated rather
 * than optional: a filter nobody asked for and a filter turned off describe
 * the same listing, and saying so keeps the query from having to guess.
 */
export type AccountFilters = {
	readonly administratorsOnly: boolean;
	readonly unverifiedOnly: boolean;
	readonly provider: AuthProvider | null;
};

@inject()
export class UserService {
	constructor(
		protected readonly activityEventService: ActivityEventService,
		protected readonly accountAccessService: AccountAccessService,
		protected readonly mailService: MailService
	) {}

	/**
	 * Whether this instance holds any account at all. Both the registration
	 * policy and the administrator rule hang off this one question.
	 */
	async hasAnyAccount(trx?: TransactionClientContract): Promise<boolean> {
		const anyAccount = await User.query({ client: trx }).select('id').first();

		return anyAccount !== null;
	}

	/**
	 * The first account an instance ever gets is its administrator, whichever
	 * authentication method opened it. Both account creation paths — the OAuth
	 * callback and the registration form — ask here instead of restating the
	 * rule.
	 */
	async isNextAccountAdmin(trx?: TransactionClientContract): Promise<boolean> {
		return !(await this.hasAnyAccount(trx));
	}

	/**
	 * Every account the filters keep, carrying the rows that describe how each
	 * one signs in.
	 *
	 * Preloaded rather than read per account: the console prints the sign-in
	 * methods of every line it lists, and asking for them one line at a time is
	 * a round trip per account.
	 */
	listAccounts({
		administratorsOnly,
		unverifiedOnly,
		provider,
	}: AccountFilters) {
		const accounts = User.query()
			.preload('passwordAuth')
			.preload('oauthAuths')
			.orderBy('email', 'asc');

		if (administratorsOnly) {
			accounts.where('isAdmin', true);
		}

		if (unverifiedOnly) {
			accounts.whereNull('emailVerifiedAt');
		}

		if (provider) {
			accounts.whereHas('oauthAuths', (query) => {
				query.where('provider', provider);
			});
		}

		return accounts;
	}

	findAccountOrFail(userId: User['id']): Promise<User> {
		return User.findOrFail(userId);
	}

	/**
	 * Every account, with what the admin dashboard says about each: how much
	 * they own, how they sign in, and when they last did.
	 *
	 * Everything is aggregated or preloaded in the same round of queries rather
	 * than read per row. The dashboard lists the whole instance, so a lookup
	 * per account is a lookup per account — the cost grows with the very number
	 * the page exists to show.
	 */
	getAccountsOverview() {
		return User.query()
			.withCount('collections', (query) => {
				query.as('totalCollections');
			})
			.withCount('links', (query) => {
				query.as('totalLinks');
			})
			.withCount('followedCollections', (query) => {
				query.as('totalFollowedCollections');
			})
			.withAggregate('auditEvents', (query) => {
				query
					.where('type', AUTH_EVENT_TYPE.LOGIN_SUCCEEDED)
					.max('created_at')
					.as('lastLoginAt');
			})
			.preload('passwordAuth')
			.preload('oauthAuths');
	}

	async promoteToAdministrator(user: User): Promise<void> {
		user.isAdmin = true;

		await user.save();
	}

	/**
	 * Takes the administrator role away, unless it is the last one standing.
	 *
	 * The administrator rows are locked for the whole transaction: two
	 * demotions racing on an instance holding exactly two administrators would
	 * otherwise each count the role the other is about to remove, and both
	 * would be let through.
	 */
	async demoteToMember(user: User): Promise<void> {
		await db.transaction(async (trx) => {
			const administrators = await User.query({ client: trx })
				.where('isAdmin', true)
				.forUpdate();

			const isLastAdministrator =
				administrators.length === 1 && administrators[0]?.id === user.id;
			if (isLastAdministrator) {
				throw new LastAdministratorException();
			}

			user.isAdmin = false;
			await user.useTransaction(trx).save();
		});
	}

	/**
	 * Starts the grace period instead of wiping outright: the row is marked
	 * disabled, not deleted, so a misclick stays recoverable until either the
	 * owner logs back in and reactivates it, or `deleteUser` catches up with it
	 * once the grace period has run out.
	 *
	 * Every existing session and token is revoked here — a disabled account has
	 * no business staying reachable anywhere it was already signed in.
	 */
	/**
	 * `requestedByAdminId` null means self-service; set means which
	 * administrator requested it. That distinction is what the login gate reads
	 * back later: only a self-requested deletion is something its own owner can
	 * undo by logging back in — an administrator's decision must not be
	 * reversible by the very account it targets. It also decides whether the
	 * confirmation mail goes out at all: warning someone that a moderation
	 * action is about to land, and how to stop it, would defeat the action.
	 */
	async requestAccountDeletion(
		userId: User['id'],
		requestedByAdminId: User['id'] | null = null
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
		reactivatedByAdminId: User['id'] | null = null
	): Promise<void> {
		const user = await User.findOrFail(userId);
		user.pendingDeletionAt = null;
		user.pendingDeletionRequestedById = null;
		await user.save();

		await this.activityEventService.record({
			type: ACTIVITY_EVENT_TYPE.ACCOUNT_REACTIVATED,
			userId,
			actorId: reactivatedByAdminId,
			subjectType: AUDIT_SUBJECT_TYPE.ACCOUNT,
			subjectId: userId,
		});
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
	 * Same grace period as self-service, started by an administrator instead —
	 * see `requestAccountDeletion`. An administrator account is never a valid
	 * target, the same protection `bulkDeleteUsers` used to enforce with an
	 * immediate wipe.
	 */
	async bulkRequestAccountDeletion(
		userIds: User['id'][],
		actorId: User['id']
	): Promise<void> {
		const targetUsers = await User.query()
			.whereIn('id', userIds)
			.andWhere('isAdmin', false);

		for (const targetUser of targetUsers) {
			await this.requestAccountDeletion(targetUser.id, actorId);
		}
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
