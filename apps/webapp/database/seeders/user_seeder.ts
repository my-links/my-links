import { DateTime } from 'luxon';
import { faker } from '@faker-js/faker';
import app from '@adonisjs/core/services/app';
import { BaseSeeder } from '@adonisjs/lucid/seeders';

import User from '#models/user';
import OauthAuth from '#models/oauth_auth';
import { AUTH_PROVIDER } from '#constants/auth';
import PasswordAuth from '#models/password_auth';
import { CollectionService } from '#services/collections/collection_service';

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
const USER_EMAIL = 'user@example.com';
const USER_PASSWORD = '^bW4zyz3Tidjqe';

export default class extends BaseSeeder {
	static environment = ['development', 'testing'];

	async run() {
		const admin = await this.seedAdmin();
		const user = await this.seedUser();

		const users = faker.helpers.multiple(() => createRandomUser(), {
			count: SEEDED_USERS_COUNT,
		});
		const createdUsers = await User.createMany(users);

		await OauthAuth.createMany(
			createdUsers.map((randomUser) => createRandomGoogleIdentity(randomUser))
		);

		await this.seedInboxes([admin, user, ...createdUsers]);
	}

	/**
	 * These accounts are written straight through the model, so they miss the
	 * Inbox `RegistrationService` opens with every real signup.
	 */
	private async seedInboxes(users: User[]): Promise<void> {
		const collectionService = await app.container.make(CollectionService);

		for (const user of users) {
			await collectionService.getOrCreateDefaultCollection(user.id);
		}
	}

	private async seedAdmin(): Promise<User> {
		const admin = await User.updateOrCreate(
			{ email: ADMIN_EMAIL },
			{
				name: 'Admin',
				nickName: 'admin',
				isAdmin: true,
				emailVerifiedAt: DateTime.now(),
			}
		);

		await PasswordAuth.updateOrCreate(
			{ userId: admin.id },
			{ password: ADMIN_PASSWORD, passwordChangedAt: DateTime.now() }
		);

		return admin;
	}

	private async seedUser(): Promise<User> {
		const user = await User.updateOrCreate(
			{ email: USER_EMAIL },
			{
				name: 'User',
				nickName: 'user',
				isAdmin: false,
				emailVerifiedAt: DateTime.now(),
			}
		);

		await PasswordAuth.updateOrCreate(
			{ userId: user.id },
			{ password: USER_PASSWORD, passwordChangedAt: DateTime.now() }
		);

		return user;
	}
}

export function createRandomUser() {
	return {
		email: faker.internet.email().toLowerCase(),
		name: faker.internet.username(),
		nickName: faker.internet.displayName(),
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
