import { Visibility } from '#collections/enums/visibility';
import Collection from '#collections/models/collection';
import User from '#user/models/user';
import { BaseSeeder } from '@adonisjs/lucid/seeders';
import { faker } from '@faker-js/faker';

const ID_OFFSET = 100;

export default class extends BaseSeeder {
	static environment = ['development', 'testing'];

	async run() {
		const users = await getUserIds();

		const collections = faker.helpers.multiple(
			(_, index) => createRandomCollection(users, ID_OFFSET + index),
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

function createRandomCollection(userIds: User['id'][], id: number) {
	const authorId = faker.helpers.arrayElements(userIds, 1).at(0);
	return {
		id,
		name: faker.string.alphanumeric({ length: { min: 5, max: 25 } }),
		description: faker.string.alphanumeric({ length: { min: 0, max: 254 } }),
		visibility: Visibility.PRIVATE,
		authorId,
	};
}
