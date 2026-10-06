import { faker } from '@faker-js/faker';
import { BaseSeeder } from '@adonisjs/lucid/seeders';

import User from '#models/user';
import Collection from '#models/collection';
import { VISIBILITY } from '#enums/collections/visibility';
import { ADMIN_EMAIL, USER_EMAIL } from '#database/seeders/user_seeder';

const MIN_COLLECTIONS_PER_USER = 3;
const MAX_COLLECTIONS_PER_USER = 6;

export default class extends BaseSeeder {
	static environment = ['development', 'testing'];

	async run() {
		const authorIds = await getSeededAuthorIds();

		const collections = authorIds.flatMap((authorId) =>
			faker.helpers.multiple(() => createRandomCollection(authorId), {
				count: faker.number.int({
					min: MIN_COLLECTIONS_PER_USER,
					max: MAX_COLLECTIONS_PER_USER,
				}),
			})
		);
		await Collection.createMany(collections);
	}
}

export async function getSeededAuthorIds() {
	const users = await User.query().whereIn('email', [ADMIN_EMAIL, USER_EMAIL]);
	return users.map(({ id }) => id);
}

function createRandomCollection(authorId: User['id']) {
	return {
		name: faker.lorem.words({ min: 1, max: 5 }),
		description: faker.lorem.sentences({ min: 0, max: 3 }),
		visibility: VISIBILITY.PRIVATE,
		authorId,
	};
}
