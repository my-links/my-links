import User from '#models/user';
import { GoogleToken } from '@adonisjs/ally/types';
import { BaseSeeder } from '@adonisjs/lucid/seeders';
import { faker } from '@faker-js/faker';

const ID_OFFSET = 100;

export default class extends BaseSeeder {
	static environment = ['development', 'testing'];

	async run() {
		const users = faker.helpers.multiple(
			(_, index) => createRandomUser(ID_OFFSET + index),
			{
				count: 25,
			}
		);
		await User.createMany(users);
	}
}

export function createRandomUser(index: number) {
	return {
		id: index,
		email: faker.internet.email(),
		name: faker.internet.username(),
		nickName: faker.internet.displayName(),
		avatarUrl: faker.image.avatar(),
		isAdmin: false,
		providerId: faker.number.int(),
		providerType: 'google' as const,
		token: {} as GoogleToken,
	};
}
