import { faker } from '@faker-js/faker';
import { BaseSeeder } from '@adonisjs/lucid/seeders';

import User from '#models/user';
import Collection from '#models/collection';
import { Visibility } from '#enums/collections/visibility';

const COLLECTIONS_PER_USER = 10;

export default class extends BaseSeeder {
	static environment = ['development', 'testing'];

	async run() {
		const userIds = await getUserIds();

		const collections = userIds.flatMap((authorId) =>
			faker.helpers.multiple(() => createRandomCollection(authorId), {
				count: COLLECTIONS_PER_USER,
			})
		);
		await Collection.createMany(collections);
	}
}

export async function getUserIds() {
	const users = await User.all();
	return users.map(({ id }) => id);
}

function createRandomCollection(authorId: User['id']) {
	return {
		name: faker.lorem.words({ min: 1, max: 5 }),
		description: faker.lorem.sentences({ min: 0, max: 3 }),
		visibility: Visibility.PRIVATE,
		authorId,
	};
}
