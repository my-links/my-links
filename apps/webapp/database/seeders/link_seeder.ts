import { faker } from '@faker-js/faker';
import { BaseSeeder } from '@adonisjs/lucid/seeders';

import Link from '#models/link';
import type User from '#models/user';
import Collection from '#models/collection';
import { getUserIds } from '#database/seeders/collection_seeder';

const SEEDED_LINKS_COUNT = 500;
const MIN_COLLECTIONS_PER_LINK = 1;
const MAX_COLLECTIONS_PER_LINK = 3;

/**
 * Real domains, so the favicon fetcher (`FaviconService`) has an actual
 * `/favicon.ico` or `<link rel="icon">` to find instead of failing against
 * `faker.internet.url()`'s made-up hosts.
 */
const REAL_DOMAINS = [
	'github.com',
	'developer.mozilla.org',
	'wikipedia.org',
	'nodejs.org',
	'typescriptlang.org',
	'react.dev',
	'vuejs.org',
	'tailwindcss.com',
	'vercel.com',
	'netlify.com',
	'digitalocean.com',
	'medium.com',
	'dev.to',
	'notion.so',
	'figma.com',
	'slack.com',
	'discord.com',
	'spotify.com',
	'reddit.com',
	'youtube.com',
	'amazon.com',
	'apple.com',
	'microsoft.com',
	'cloudflare.com',
];

type CollectionIdsByAuthor = Map<User['id'], Collection['id'][]>;

type LinkAttributes = {
	readonly name: string;
	readonly description: string;
	readonly url: string;
	readonly favorite: boolean;
	readonly authorId: User['id'];
};

/**
 * A link and the collections it will belong to, kept together because the
 * membership can only be written once the link row has an id.
 */
type SeededLink = {
	readonly attributes: LinkAttributes;
	readonly collectionIds: Collection['id'][];
};

export default class extends BaseSeeder {
	static environment = ['development', 'testing'];

	async run() {
		const collectionIdsByAuthor = await groupCollectionIdsByAuthor();
		const authorIds = await getAuthorIdsOwningACollection(
			collectionIdsByAuthor
		);

		if (authorIds.length === 0) return;

		const seededLinks = faker.helpers.multiple(
			() => createRandomLink(authorIds, collectionIdsByAuthor),
			{ count: SEEDED_LINKS_COUNT }
		);

		const createdLinks = await Link.createMany(
			seededLinks.map(({ attributes }) => attributes)
		);

		// `createMany` answers in the order it was given, which is what pairs
		// each persisted link back with the collections drawn for it.
		await Promise.all(
			createdLinks.map((link, index) =>
				link.related('collections').attach(seededLinks[index].collectionIds)
			)
		);
	}
}

async function groupCollectionIdsByAuthor(): Promise<CollectionIdsByAuthor> {
	const collections = await Collection.all();

	return collections.reduce<CollectionIdsByAuthor>(
		(collectionIdsByAuthor, collection) => {
			const ownedIds = collectionIdsByAuthor.get(collection.authorId) ?? [];
			collectionIdsByAuthor.set(collection.authorId, [
				...ownedIds,
				collection.id,
			]);

			return collectionIdsByAuthor;
		},
		new Map()
	);
}

/**
 * Collections are handed to a random subset of the seeded users, so the ones
 * left without any cannot own a link either.
 */
async function getAuthorIdsOwningACollection(
	collectionIdsByAuthor: CollectionIdsByAuthor
): Promise<User['id'][]> {
	const userIds = await getUserIds();

	return userIds.filter((userId) => collectionIdsByAuthor.has(userId));
}

function createRandomLink(
	authorIds: User['id'][],
	collectionIdsByAuthor: CollectionIdsByAuthor
): SeededLink {
	const authorId = faker.helpers.arrayElement(authorIds);
	const ownedCollectionIds = collectionIdsByAuthor.get(authorId) ?? [];

	return {
		attributes: {
			name: faker.lorem.words({ min: 1, max: 5 }),
			description: faker.lorem.sentences({ min: 0, max: 3 }),
			url: createRandomUrl(),
			favorite: faker.datatype.boolean(),
			authorId,
		},
		collectionIds: faker.helpers.arrayElements(ownedCollectionIds, {
			min: MIN_COLLECTIONS_PER_LINK,
			max: MAX_COLLECTIONS_PER_LINK,
		}),
	};
}

function createRandomUrl(): string {
	const domain = faker.helpers.arrayElement(REAL_DOMAINS);
	return `https://${domain}`;
}
