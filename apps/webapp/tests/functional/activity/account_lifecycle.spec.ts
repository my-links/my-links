import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import Link from '#models/link';
import Collection from '#models/collection';
import AuditEvent from '#models/audit_event';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { Visibility } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';

async function createAdmin(prefix = 'admin'): Promise<User> {
	const user = await createUser({ emailPrefix: prefix });
	user.isAdmin = true;
	await user.save();

	return user;
}

async function seedOneCollectionAndLink(user: User): Promise<void> {
	const collection = await Collection.create({
		name: 'Work',
		description: null,
		visibility: Visibility.PRIVATE,
		icon: null,
		authorId: user.id,
	});
	const link = await Link.create({
		name: 'A link',
		description: null,
		url: 'https://example.com',
		favorite: false,
		authorId: user.id,
	});
	await link.related('collections').attach([collection.id]);
}

test.group('Account deletion — self service', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should journal the wipe with its data counts and no actor', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'wipe-self' });
		await seedOneCollectionAndLink(user);

		await client
			.delete('/user/settings/account')
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const event = await AuditEvent.query()
			.where('subjectType', AUDIT_SUBJECT_TYPE.ACCOUNT)
			.andWhere('subjectId', user.id)
			.andWhere('type', ACTIVITY_EVENT_TYPE.ACCOUNT_DATA_WIPED)
			.firstOrFail();

		assert.deepEqual(event.metadata, { collections: 1, links: 1 });
		assert.isNull(event.actorId);
	});

	test('should keep the row after the account is gone, with the name cleared', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'wipe-survives' });
		const userId = user.id;

		await client
			.delete('/user/settings/account')
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const stillExists = await User.find(userId);
		assert.isNull(stillExists);

		const event = await AuditEvent.query()
			.where('subjectType', AUDIT_SUBJECT_TYPE.ACCOUNT)
			.andWhere('subjectId', userId)
			.andWhere('type', ACTIVITY_EVENT_TYPE.ACCOUNT_DATA_WIPED)
			.firstOrFail();

		assert.isNull(event.userId);
	});
});

test.group('Account deletion — administrator bulk delete', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should journal a wipe per account with the administrator as actor', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin('wipe-admin');
		const target = await createUser({ emailPrefix: 'wipe-target' });
		await seedOneCollectionAndLink(target);

		await client
			.post('/admin/users/bulk-delete')
			.json({ userIds: [target.id] })
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		const event = await AuditEvent.query()
			.where('subjectType', AUDIT_SUBJECT_TYPE.ACCOUNT)
			.andWhere('subjectId', target.id)
			.andWhere('type', ACTIVITY_EVENT_TYPE.ACCOUNT_DATA_WIPED)
			.firstOrFail();

		assert.equal(event.actorId, administrator.id);
		assert.deepEqual(event.metadata, { collections: 1, links: 1 });
	});

	test('should neither delete nor journal an administrator account', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin('wipe-admin-caller');
		const protectedAdmin = await createAdmin('wipe-admin-target');

		await client
			.post('/admin/users/bulk-delete')
			.json({ userIds: [protectedAdmin.id] })
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		const stillExists = await User.find(protectedAdmin.id);
		assert.isNotNull(stillExists);

		const events = await AuditEvent.query()
			.where('subjectType', AUDIT_SUBJECT_TYPE.ACCOUNT)
			.andWhere('subjectId', protectedAdmin.id)
			.andWhere('type', ACTIVITY_EVENT_TYPE.ACCOUNT_DATA_WIPED);
		assert.lengthOf(events, 0);
	});
});
