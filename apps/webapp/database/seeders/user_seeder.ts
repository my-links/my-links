import { DateTime } from 'luxon';
import { faker } from '@faker-js/faker';
import { BaseSeeder } from '@adonisjs/lucid/seeders';

import User from '#models/user';
import OauthAuth from '#models/oauth_auth';
import { AUTH_PROVIDER } from '#constants/auth';

const SEEDED_USERS_COUNT = 25;

export default class extends BaseSeeder {
	static environment = ['development', 'testing'];

	async run() {
		const users = faker.helpers.multiple(() => createRandomUser(), {
			count: SEEDED_USERS_COUNT,
		});
		const createdUsers = await User.createMany(users);

		await OauthAuth.createMany(
			createdUsers.map((user) => createRandomGoogleIdentity(user))
		);
	}
}

export function createRandomUser() {
	return {
		email: faker.internet.email(),
		name: faker.internet.username(),
		nickName: faker.internet.displayName(),
		avatarUrl: faker.image.avatar(),
		isAdmin: false,
		emailVerifiedAt: DateTime.now(),
	};
}

function createRandomGoogleIdentity(user: User) {
	return {
		userId: user.id,
		provider: AUTH_PROVIDER.GOOGLE,
		providerUserId: String(faker.number.int()),
		linkedAt: DateTime.now(),
	};
}
