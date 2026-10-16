import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import { VISIBILITY } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';
import { inertiaPageProps } from '#tests/helpers/inertia_page';
import {
	createLink,
	attachLinkToCollection,
} from '#tests/factories/link_factory';
import {
	createCollection,
	followCollection,
} from '#tests/factories/collection_factory';

type SharedCollectionProps = {
	activeCollection: {
		author: Record<string, unknown>;
		links: Array<Record<string, unknown>>;
	};
};

const PRIVATE_LINK_KEYS = ['favorite', 'clicks', 'lastClickedAt'];
const PRIVATE_AUTHOR_KEYS = ['isAdmin', 'createdAt', 'updatedAt'];

function presentKeys(subject: Record<string, unknown>, keys: string[]) {
	return keys.filter((key) => key in subject);
}

async function seedPublicCollection() {
	const owner = await createUser({ emailPrefix: 'shape-owner' });
	const collection = await createCollection({
		author: owner,
		visibility: VISIBILITY.PUBLIC,
	});
	const link = await createLink({ author: owner });
	await attachLinkToCollection(link, collection);
	return { owner, collection };
}

test.group('Public collection shape', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should not expose usage stats on links of a shared page to an anonymous visitor', async ({
		client,
		assert,
	}) => {
		const { collection } = await seedPublicCollection();

		const response = await client.get(`/shared/${collection.id}`).withInertia();

		const props = inertiaPageProps(response) as SharedCollectionProps;
		const [link] = props.activeCollection.links;
		assert.deepEqual(presentKeys(link, PRIVATE_LINK_KEYS), []);
	});

	test('should expose only id and fullname for the author of a shared page', async ({
		client,
		assert,
	}) => {
		const { collection } = await seedPublicCollection();

		const response = await client.get(`/shared/${collection.id}`).withInertia();

		const props = inertiaPageProps(response) as SharedCollectionProps;
		assert.deepEqual(Object.keys(props.activeCollection.author).sort(), [
			'fullname',
			'id',
		]);
	});

	test('should not expose usage stats or author internals to a follower through the API', async ({
		client,
		assert,
	}) => {
		const { collection } = await seedPublicCollection();
		const follower = await createUser({ emailPrefix: 'shape-follower' });
		await followCollection(collection, follower);

		const response = await client
			.get('/api/v1/collections')
			.withGuard('api')
			.loginAs(follower);

		const body = response.body() as {
			followedCollections: Array<SharedCollectionProps['activeCollection']>;
		};
		const [followed] = body.followedCollections;
		assert.deepEqual(presentKeys(followed.links[0], PRIVATE_LINK_KEYS), []);
		assert.deepEqual(presentKeys(followed.author, PRIVATE_AUTHOR_KEYS), []);
	});
});
