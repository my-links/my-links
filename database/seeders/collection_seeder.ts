import { Visibility } from '#collections/enums/visibility';
import Collection from '#collections/models/collection';
import User from '#user/models/user';
import { BaseSeeder } from '@adonisjs/lucid/seeders';
import { faker } from '@faker-js/faker';

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

let collectionId = 0;
function createRandomCollection(userIds: User['id'][]) {
	const authorId = faker.helpers.arrayElements(userIds, 1).at(0);
	collectionId++;
	return {
		id: collectionId,
		name: faker.string.alphanumeric({ length: { min: 5, max: 25 } }),
		description: faker.string.alphanumeric({ length: { min: 0, max: 254 } }),
		visibility: Visibility.PRIVATE,
		authorId,
	};
}
