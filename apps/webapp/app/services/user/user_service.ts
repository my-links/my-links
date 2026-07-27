import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import User from '#models/user';

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
	 * Counts the relations in the query rather than per user: the admin
	 * dashboard lists every account, so a count per row would be one round trip
	 * per user.
	 */
	getAllUsersWithTotalRelations() {
		return User.query()
			.withCount('collections', (query) => {
				query.as('totalCollections');
			})
			.withCount('links', (query) => {
				query.as('totalLinks');
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
