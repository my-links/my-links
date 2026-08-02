import { faker } from '@faker-js/faker';
import { BaseSeeder } from '@adonisjs/lucid/seeders';

import User from '#models/user';
import Collection from '#models/collection';
import { Visibility } from '#enums/collections/visibility';

export default class extends BaseSeeder {
	static environment = ['development', 'testing'];

	async run() {
		const users = await getUserIds();

		const collections = faker.helpers.multiple(
			() => createRandomCollection(users),
			{
				count: 50,
			}
		);
		await Collection.createMany(collections);
	}
}

export async function getUserIds() {
	const users = await User.all();
	return users.map(({ id }) => id);
}

function createRandomCollection(userIds: User['id'][]) {
	const authorId = faker.helpers.arrayElements(userIds, 1).at(0);
	return {
		name: faker.lorem.words({ min: 1, max: 5 }),
		description: faker.lorem.sentences({ min: 0, max: 3 }),
		visibility: Visibility.PRIVATE,
		authorId,
	};
}
