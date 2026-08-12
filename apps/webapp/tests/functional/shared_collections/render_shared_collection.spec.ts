import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import { VISIBILITY } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';
import { createCollection } from '#tests/factories/collection_factory';
import {
	createLink,
	attachLinkToCollection,
} from '#tests/factories/link_factory';

test.group('Shared collection — page', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should render a public collection with links without crashing SSR', async ({
		client,
		assert,
	}) => {
		const owner = await createUser();
		const collection = await createCollection({
			author: owner,
			name: 'Public reads',
			visibility: VISIBILITY.PUBLIC,
		});
		const link = await createLink({ author: owner, name: 'Shared link' });
		await attachLinkToCollection(link, collection);

		// No `.withInertia()` on purpose — this is the plain browser request
		// path that triggers server-side React rendering, which is where
		// `followedCollections is not iterable` used to blow up (L-02).
		const response = await client.get(`/shared/${collection.id}`);

		response.assertStatus(200);
		assert.include(response.text(), 'Shared link');
	});
});
