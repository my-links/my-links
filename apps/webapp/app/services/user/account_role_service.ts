import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';

import User from '#models/user';
import { LastAdministratorException } from '#exceptions/admin/last_administrator_exception';

@inject()
export class AccountRoleService {
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
}
