import { getUserIds } from '#database/seeders/collection_seeder';
import Collection from '#models/collection';
import Link from '#models/link';
import User from '#models/user';
import { BaseSeeder } from '@adonisjs/lucid/seeders';
import { faker } from '@faker-js/faker';

export default class extends BaseSeeder {
	static environment = ['development', 'testing'];

	async run() {
		const users = await getUserIds();

		const links = await Promise.all(
			faker.helpers.multiple(async () => createRandomLink(users), {
				count: 500,
			})
		);
		await Link.createMany(links.filter((a) => typeof a !== 'undefined') as any);
	}
}

async function getCollectionIds(authorId: User['id']) {
	const collection = await Collection.findManyBy('author_id', authorId);
	return collection.map(({ id }) => id);
}

async function createRandomLink(userIds: User['id'][]) {
	const authorId = faker.helpers.arrayElements(userIds, 1).at(0)!;
	const collections = await getCollectionIds(authorId);

	const collectionId = faker.helpers.arrayElements(collections, 1).at(0);
	if (!collectionId) {
		return undefined;
	}

	return {
		name: faker.string.alphanumeric({ length: { min: 5, max: 25 } }),
		description: faker.string.alphanumeric({ length: { min: 0, max: 254 } }),
		url: faker.internet.url(),
		favorite: faker.number.int({ min: 0, max: 1 }),
		authorId,
		collectionId,
	};
}
