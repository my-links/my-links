import { test } from '@japa/runner';
import type { ApiClient } from '@japa/api-client';
import testUtils from '@adonisjs/core/services/test_utils';

import Link from '#models/link';
import type User from '#models/user';
import Collection from '#models/collection';
import { createUser } from '#tests/factories/user_factory';
import { DATA_IMPORT_BURST_TIER } from '#lib/limiter/attempt_tiers';
import {
	MAXIMUM_IMPORT_LINKS,
	MAXIMUM_IMPORT_COLLECTIONS,
} from '#constants/data_import';

const IMPORT_ROUTE = '/user/settings/import';

const VALID_EXPORT = {
	collections: [
		{
			key: 'imported-collection-key',
			name: 'Imported collection',
			description: null,
			visibility: 'PRIVATE',
			icon: null,
		},
	],
	links: [
		{
			name: 'Imported link',
			description: null,
			url: 'https://example.com',
			favorite: false,
			collectionKeys: ['imported-collection-key'],
		},
	],
};

const VALID_EXPORT_WITH_LEGACY_INDEXES = {
	collections: [
		{
			name: 'Imported collection',
			description: null,
			visibility: 'PRIVATE',
			icon: null,
		},
	],
	links: [
		{
			name: 'Imported link',
			description: null,
			url: 'https://example.com',
			favorite: false,
			collectionIndexes: [0],
		},
	],
};

function uploadOf(contents: string, filename: string) {
	return { buffer: Buffer.from(contents), filename };
}

test.group('User settings import: upload', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should import the collections and links of a valid export file', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'import-valid' });
		const upload = uploadOf(JSON.stringify(VALID_EXPORT), 'export.json');

		await client
			.post(IMPORT_ROUTE)
			.file('file', upload.buffer, { filename: upload.filename })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const importedLink = await Link.query()
			.where('authorId', user.id)
			.firstOrFail();
		assert.equal(importedLink.name, 'Imported link');
	});

	test('should still import a file exported before per-collection keys existed', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'import-legacy-index' });
		const upload = uploadOf(
			JSON.stringify(VALID_EXPORT_WITH_LEGACY_INDEXES),
			'export.json'
		);

		await client
			.post(IMPORT_ROUTE)
			.file('file', upload.buffer, { filename: upload.filename })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const importedLink = await Link.query()
			.where('authorId', user.id)
			.firstOrFail();
		assert.equal(importedLink.name, 'Imported link');
	});

	test('should refuse a file that is not JSON without crashing', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'import-extname' });
		const upload = uploadOf('name,url\na,b', 'export.csv');

		const response = await client
			.post(IMPORT_ROUTE)
			.file('file', upload.buffer, { filename: upload.filename })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(302);
		response.assertFlashMessage('inputErrorsBag', {
			file: ['Invalid file extension csv. Only json is allowed'],
		});
	});

	test('should tell the user when the file is not parsable JSON', async ({
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'import-broken' });
		const upload = uploadOf('{ not json', 'export.json');

		const response = await client
			.post(IMPORT_ROUTE)
			.file('file', upload.buffer, { filename: upload.filename })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		response.assertStatus(302);
		response.assertFlashMessage('error', 'The uploaded file is not valid JSON');
	});
});

function linkEntry(index: number, collectionKey: string) {
	return {
		name: `Link ${index}`,
		description: null,
		url: 'https://example.com',
		favorite: false,
		collectionKeys: [collectionKey],
	};
}

function exportWithLinkCount(linkCount: number) {
	return {
		collections: [{ key: 'bulk', name: 'Bulk', visibility: 'PRIVATE' }],
		links: Array.from({ length: linkCount }, (_, index) =>
			linkEntry(index, 'bulk')
		),
	};
}

async function postImport(
	client: ApiClient,
	user: User,
	exportContents: unknown
) {
	const upload = uploadOf(JSON.stringify(exportContents), 'export.json');

	return client
		.post(IMPORT_ROUTE)
		.file('file', upload.buffer, { filename: upload.filename })
		.withCsrfToken()
		.loginAs(user)
		.redirects(0);
}

async function countCollectionsOf(user: User) {
	const row = await Collection.query()
		.where('authorId', user.id)
		.count('* as total')
		.firstOrFail();

	return Number(row.$extras.total);
}

test.group('User settings import: size limits', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should refuse a file with more collections than allowed and write nothing', async ({
		assert,
		client,
	}) => {
		const user = await createUser({
			emailPrefix: 'import-too-many-collections',
		});
		const tooManyCollections = Array.from(
			{ length: MAXIMUM_IMPORT_COLLECTIONS + 1 },
			(_, index) => ({ name: `Collection ${index}`, visibility: 'PRIVATE' })
		);

		const response = await postImport(client, user, {
			collections: tooManyCollections,
		});

		response.assertStatus(302);
		assert.equal(await countCollectionsOf(user), 0);
	});

	test('should refuse a file with more links than allowed in total and write nothing', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'import-too-many-links' });
		const halfOfTheLimit = MAXIMUM_IMPORT_LINKS / 2;
		const nestedLinks = Array.from({ length: halfOfTheLimit }, (_, index) => ({
			name: `Nested ${index}`,
			url: 'https://example.com',
			favorite: false,
		}));
		const topLevelLinks = exportWithLinkCount(halfOfTheLimit + 1).links;

		const response = await postImport(client, user, {
			collections: [
				{
					key: 'bulk',
					name: 'Bulk',
					visibility: 'PRIVATE',
					links: nestedLinks,
				},
			],
			links: topLevelLinks,
		});

		response.assertFlashMessage(
			'error',
			`An import can hold at most ${MAXIMUM_IMPORT_COLLECTIONS} collections and ${MAXIMUM_IMPORT_LINKS} links`
		);
		assert.equal(await countCollectionsOf(user), 0);
	});

	test('should import a file at the link limit', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'import-at-limit' });

		await postImport(client, user, exportWithLinkCount(MAXIMUM_IMPORT_LINKS));

		const importedLinks = await Link.query()
			.where('authorId', user.id)
			.count('* as total')
			.firstOrFail();
		assert.equal(Number(importedLinks.$extras.total), MAXIMUM_IMPORT_LINKS);
	});

	test('should number imported links in file order within their collection', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'import-positions' });

		await postImport(client, user, exportWithLinkCount(3));

		const collection = await Collection.query()
			.where('authorId', user.id)
			.preload('links', (query) => {
				query.apply((scopes) => scopes.orderedInCollection());
			})
			.firstOrFail();
		assert.deepEqual(
			collection.links.map((link) => link.name),
			['Link 0', 'Link 1', 'Link 2']
		);
	});
});

test.group('User settings import: throttle', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should refuse imports once the hourly budget is spent', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'import-throttled' });

		for (
			let attempt = 0;
			attempt < DATA_IMPORT_BURST_TIER.requests;
			attempt++
		) {
			await postImport(client, user, VALID_EXPORT);
		}
		await postImport(client, user, VALID_EXPORT);

		assert.equal(
			await countCollectionsOf(user),
			DATA_IMPORT_BURST_TIER.requests
		);
	});
});

function exportWithLinkUrl(url: string) {
	return {
		collections: [{ key: 'one', name: 'One', visibility: 'PRIVATE' }],
		links: [{ ...linkEntry(0, 'one'), url }],
	};
}

test.group('User settings import: field rules', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should refuse an unknown visibility with a validation error instead of crashing', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'import-bad-visibility' });

		const response = await postImport(client, user, {
			collections: [{ name: 'One', visibility: 'SECRET' }],
		});

		response.assertStatus(302);
		assert.exists(response.flashMessage('inputErrorsBag'));
		assert.equal(await countCollectionsOf(user), 0);
	});

	test('should refuse an icon that is not an emoji', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'import-bad-icon' });

		await postImport(client, user, {
			collections: [{ name: 'One', visibility: 'PRIVATE', icon: 'abc' }],
		});

		assert.equal(await countCollectionsOf(user), 0);
	});

	for (const unsafeUrl of ['javascript:alert(1)', 'ftp://example.com/file']) {
		test(`should refuse the ${unsafeUrl.split(':')[0]} URL scheme`, async ({
			assert,
			client,
		}) => {
			const user = await createUser({ emailPrefix: 'import-bad-url-scheme' });

			await postImport(client, user, exportWithLinkUrl(unsafeUrl));

			assert.equal(await countCollectionsOf(user), 0);
		});
	}

	test('should normalize a bare domain to an https URL', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'import-bare-domain' });

		await postImport(client, user, exportWithLinkUrl('example.com'));

		const importedLink = await Link.query()
			.where('authorId', user.id)
			.firstOrFail();
		assert.equal(importedLink.url, 'https://example.com');
	});
});
