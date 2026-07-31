import db from '@adonisjs/lucid/services/db';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import User from '#models/user';
import { AUTH_EVENT_TYPE, type AuthProvider } from '#constants/auth';
import LastAdministratorException from '#exceptions/admin/last_administrator_exception';

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

export class UserService {
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
			.withAggregate('authEvents', (query) => {
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

	deleteUser(userId: User['id']) {
		return User.query().where('id', userId).delete();
	}

	bulkDeleteUsers(userIds: User['id'][]) {
		return User.query()
			.whereIn('id', userIds)
			.andWhere('isAdmin', false)
			.delete();
	}
}
