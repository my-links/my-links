import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import Link from '#models/link';
import Collection from '#models/collection';
import AuditEvent from '#models/audit_event';
import UserSession from '#models/user_session';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { VISIBILITY } from '#enums/collections/visibility';
import { createUser } from '#tests/factories/user_factory';
import { createUserSession } from '#tests/factories/user_session_factory';
import { enableOutgoingMail, queuedMails } from '#tests/helpers/outgoing_mail';
import AccountDeletionRequestedNotification from '#mails/account_deletion_requested_notification';

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
		visibility: VISIBILITY.PRIVATE,
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
	group.each.setup(enableOutgoingMail);

	test('should disable the account instead of wiping it outright', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'disable-self' });

		await client
			.delete('/user/settings/account')
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const stillExists = await User.find(user.id);
		assert.isNotNull(stillExists);
		assert.isNotNull(stillExists?.pendingDeletionAt);
	});

	test('should journal the deletion request with no actor', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'disable-journal' });

		await client
			.delete('/user/settings/account')
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const event = await AuditEvent.query()
			.where('subjectType', AUDIT_SUBJECT_TYPE.ACCOUNT)
			.andWhere('subjectId', user.id)
			.andWhere('type', ACTIVITY_EVENT_TYPE.ACCOUNT_DELETION_REQUESTED)
			.firstOrFail();

		assert.isNull(event.actorId);
	});

	test('should queue a confirmation mail', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'disable-mail' });

		await client
			.delete('/user/settings/account')
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		queuedMails().assertQueued(AccountDeletionRequestedNotification, (mail) =>
			mail.message.hasTo(user.email)
		);
	});

	test('should revoke every other session and sign the requester out', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'disable-sessions' });
		const otherSession = await createUserSession(user);

		const response = await client
			.delete('/user/settings/account')
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const remainingSession = await UserSession.find(otherSession.id);
		assert.isNull(remainingSession);
		response.assertSessionMissing('auth_web');
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
