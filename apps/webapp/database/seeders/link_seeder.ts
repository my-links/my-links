import { faker } from '@faker-js/faker';
import { BaseSeeder } from '@adonisjs/lucid/seeders';

import Link from '#models/link';
import type User from '#models/user';
import Collection from '#models/collection';

const LINKS_PER_COLLECTION = 15;
const DESCRIPTION_MAX_LENGTH = 254;

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

type LinkAttributes = {
	readonly name: string;
	readonly description: string;
	readonly url: string;
	readonly favorite: boolean;
	readonly authorId: User['id'];
};

/**
 * A link and the collection it will belong to, kept together because the
 * membership can only be written once the link row has an id.
 */
type SeededLink = {
	readonly attributes: LinkAttributes;
	readonly collectionId: Collection['id'];
};

export default class extends BaseSeeder {
	static environment = ['development', 'testing'];

	async run() {
		const collections = await Collection.all();

		const seededLinks = collections.flatMap((collection) =>
			faker.helpers.multiple(() => createRandomLink(collection), {
				count: LINKS_PER_COLLECTION,
			})
		);

		const createdLinks = await Link.createMany(
			seededLinks.map(({ attributes }) => attributes)
		);

		// `createMany` answers in the order it was given, which is what pairs
		// each persisted link back with the collection it was drawn for.
		await Promise.all(
			createdLinks.map((link, index) =>
				link.related('collections').attach([seededLinks[index].collectionId])
			)
		);
	}
}

function createRandomLink(collection: Collection): SeededLink {
	return {
		attributes: {
			name: faker.lorem.words({ min: 1, max: 5 }),
			description: faker.lorem
				.sentences({ min: 0, max: 3 })
				.slice(0, DESCRIPTION_MAX_LENGTH),
			url: createRandomUrl(),
			favorite: faker.datatype.boolean(),
			authorId: collection.authorId,
		},
		collectionId: collection.id,
	};
}

function createRandomUrl(): string {
	const domain = faker.helpers.arrayElement(REAL_DOMAINS);
	return `https://${domain}`;
}
