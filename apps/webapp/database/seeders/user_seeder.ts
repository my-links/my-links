import { DateTime } from 'luxon';
import { faker } from '@faker-js/faker';
import { BaseSeeder } from '@adonisjs/lucid/seeders';

import User from '#models/user';
import OauthAuth from '#models/oauth_auth';
import { AUTH_PROVIDER } from '#constants/auth';
import PasswordAuth from '#models/password_auth';

const SEEDED_USERS_COUNT = 25;

/**
 * The one seeded account a developer can actually sign in with: the random
 * users below only carry a Google identity, which is unusable on an instance
 * running without the provider configured. Seeders never run outside
 * development and testing — see `static environment` below and the guard in
 * `main/index_seeder.ts` — so this known password stays in throwaway
 * databases.
 */
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = '^bW4zyz3Tidjqe';

export default class extends BaseSeeder {
	static environment = ['development', 'testing'];

	async run() {
		await this.seedAdmin();

		const users = faker.helpers.multiple(() => createRandomUser(), {
			count: SEEDED_USERS_COUNT,
		});
		const createdUsers = await User.createMany(users);

		await OauthAuth.createMany(
			createdUsers.map((user) => createRandomGoogleIdentity(user))
		);
	}

	/**
	 * Upserted rather than created, so re-seeding a database that already has
	 * the account resets its password instead of failing on the unique email.
	 */
	private async seedAdmin(): Promise<void> {
		const admin = await User.updateOrCreate(
			{ email: ADMIN_EMAIL },
			{
				name: 'Admin',
				nickName: 'admin',
				avatarUrl: null,
				isAdmin: true,
				emailVerifiedAt: DateTime.now(),
			}
		);

		await PasswordAuth.updateOrCreate(
			{ userId: admin.id },
			{ password: ADMIN_PASSWORD, passwordChangedAt: DateTime.now() }
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
