import User from '#models/user';

export class UserService {
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
