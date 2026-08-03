import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import Link from '#models/link';
import Collection from '#models/collection';
import { Visibility } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';

test.group('Shared collection — page', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should render a public collection with links without crashing SSR', async ({
		client,
		assert,
	}) => {
		const owner = await createUser();
		const collection = await Collection.create({
			name: 'Public reads',
			description: null,
			visibility: Visibility.PUBLIC,
			icon: null,
			authorId: owner.id,
		});
		const link = await Link.create({
			name: 'Shared link',
			url: 'https://example.com',
			favorite: false,
			authorId: owner.id,
		});
		await link.related('collections').attach([collection.id]);

		// No `.withInertia()` on purpose — this is the plain browser request
		// path that triggers server-side React rendering, which is where
		// `followedCollections is not iterable` used to blow up (L-02).
		const response = await client.get(`/shared/${collection.id}`);

		response.assertStatus(200);
		assert.include(response.text(), 'Shared link');
	});
});
