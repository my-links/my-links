import User from '#models/user';

export class UserService {
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
