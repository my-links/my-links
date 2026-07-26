import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import Link from '#models/link';
import { createUser } from '#tests/factories/user_factory';

const IMPORT_ROUTE = '/user/settings/import';

const VALID_EXPORT = {
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

test.group('User settings import — upload', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

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
