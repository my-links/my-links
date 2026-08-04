import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import Link from '#models/link';
import type User from '#models/user';
import Collection from '#models/collection';
import AuditEvent from '#models/audit_event';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { Visibility } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';
import { SyncJournalService } from '#services/sync/sync_journal_service';
import { ExportImportService } from '#services/user/export_import_service';
import { CollectionService } from '#services/collections/collection_service';
import { ActivityEventService } from '#services/activity/activity_event_service';
import { CollectionLinkService } from '#services/collections/collection_link_service';

function buildService() {
	const collectionLinkService = new CollectionLinkService();
	return new ExportImportService(
		new CollectionService(
			new SyncJournalService(),
			new ActivityEventService(),
			collectionLinkService
		),
		new ActivityEventService(),
		collectionLinkService
	);
}

async function createCollection(user: User, name: string) {
	return Collection.create({
		name,
		description: null,
		visibility: Visibility.PRIVATE,
		icon: null,
		authorId: user.id,
	});
}

async function collectionIdsForLinkNamed(user: User, name: string) {
	const link = await Link.query()
		.where('author_id', user.id)
		.andWhere('name', name)
		.preload('collections')
		.firstOrFail();
	return link.collections.map((collection) => collection.id);
}

test.group('Export/import — multi-collection', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should export a link once with an index per collection it belongs to', async ({
		assert,
	}) => {
		const user = await createUser();
		const work = await createCollection(user, 'Work');
		const reading = await createCollection(user, 'Reading');
		const link = await Link.create({
			name: 'Shared link',
			description: null,
			url: 'https://example.com',
			favorite: false,
			authorId: user.id,
		});
		await link.related('collections').attach([work.id, reading.id]);

		const data = await buildService().exportUserData(user.id);

		assert.lengthOf(data.links, 1);
		assert.equal(data.links[0].name, 'Shared link');
		// Collections are exported ordered by name: Reading (0), Work (1).
		assert.sameMembers(data.links[0].collectionIndexes, [0, 1]);
	});

	test('should import the top-level format into multi-collection membership', async ({
		assert,
	}) => {
		const user = await createUser();

		await buildService().importUserData(user.id, {
			collections: [
				{ name: 'Work', visibility: 'PRIVATE' },
				{ name: 'Reading', visibility: 'PRIVATE' },
			],
			links: [
				{
					name: 'Shared link',
					url: 'https://example.com',
					favorite: false,
					collectionIndexes: [0, 1],
				},
			],
		});

		const collections = await Collection.query()
			.where('author_id', user.id)
			.orderBy('name', 'asc');
		const membership = await collectionIdsForLinkNamed(user, 'Shared link');
		assert.sameMembers(
			membership,
			collections.map((collection) => collection.id)
		);
	});

	test('should import the legacy nested-links format', async ({ assert }) => {
		const user = await createUser();

		await buildService().importUserData(user.id, {
			collections: [
				{
					name: 'Work',
					visibility: 'PRIVATE',
					links: [
						{
							name: 'Legacy link',
							url: 'https://example.com',
							favorite: false,
						},
					],
				},
			],
		});

		const work = await Collection.query()
			.where('author_id', user.id)
			.andWhere('name', 'Work')
			.firstOrFail();
		const membership = await collectionIdsForLinkNamed(user, 'Legacy link');
		assert.deepEqual(membership, [work.id]);
	});

	test('should fall back to Inbox when an imported link references no collection', async ({
		assert,
	}) => {
		const user = await createUser();

		await buildService().importUserData(user.id, {
			collections: [{ name: 'Work', visibility: 'PRIVATE' }],
			links: [
				{
					name: 'Homeless link',
					url: 'https://example.com',
					favorite: false,
					collectionIndexes: [],
				},
			],
		});

		const inbox = await Collection.query()
			.where('author_id', user.id)
			.andWhere('is_default', true)
			.firstOrFail();
		const membership = await collectionIdsForLinkNamed(user, 'Homeless link');
		assert.deepEqual(membership, [inbox.id]);
	});

	test('should round-trip a multi-collection export into another account', async ({
		assert,
	}) => {
		const source = await createUser();
		const work = await createCollection(source, 'Work');
		const reading = await createCollection(source, 'Reading');
		const link = await Link.create({
			name: 'Round trip link',
			description: null,
			url: 'https://example.com',
			favorite: true,
			authorId: source.id,
		});
		await link.related('collections').attach([work.id, reading.id]);

		const exported = await buildService().exportUserData(source.id);

		const target = await createUser();
		await buildService().importUserData(target.id, exported);

		const targetCollections = await Collection.query()
			.where('author_id', target.id)
			.orderBy('name', 'asc');
		const membership = await collectionIdsForLinkNamed(
			target,
			'Round trip link'
		);
		assert.sameMembers(
			membership,
			targetCollections.map((collection) => collection.id)
		);
	});
});

test.group('Export/import — activity journal', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should journal an export, never the collection or link names', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'activity-export' });
		await createCollection(user, 'Secret collection');

		await buildService().exportUserData(user.id);

		const event = await AuditEvent.query()
			.where('userId', user.id)
			.andWhere('type', ACTIVITY_EVENT_TYPE.DATA_EXPORTED)
			.firstOrFail();
		assert.equal(event.subjectType, AUDIT_SUBJECT_TYPE.ACCOUNT);
		assert.equal(event.subjectId, user.id);
		assert.notInclude(JSON.stringify(event.metadata ?? {}), 'Secret');
	});

	test('should journal an import with the collection and link counts', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'activity-import' });

		await buildService().importUserData(user.id, {
			collections: [
				{ name: 'Work', visibility: 'PRIVATE' },
				{ name: 'Reading', visibility: 'PRIVATE' },
			],
			links: [
				{
					name: 'Imported link',
					url: 'https://example.com',
					favorite: false,
					collectionIndexes: [0, 1],
				},
			],
		});

		const event = await AuditEvent.query()
			.where('userId', user.id)
			.andWhere('type', ACTIVITY_EVENT_TYPE.DATA_IMPORTED)
			.firstOrFail();
		assert.equal(event.subjectType, AUDIT_SUBJECT_TYPE.ACCOUNT);
		assert.deepEqual(event.metadata, { collections: 2, links: 1 });
	});
});
