import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import AuditEvent from '#models/audit_event';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { createUser } from '#tests/factories/user_factory';

const RENAME_ROUTE = '/user/settings/account';

test.group('Rename account', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should update the display name', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'rename-account' });

		await client
			.put(RENAME_ROUTE)
			.form({ nickName: 'New Name' })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		await user.refresh();
		assert.equal(user.nickName, 'New Name');
	});

	test('should record a rename event', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'rename-account-journal' });

		await client
			.put(RENAME_ROUTE)
			.form({ nickName: 'New Name' })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const event = await AuditEvent.query()
			.where('userId', user.id)
			.andWhere('type', ACTIVITY_EVENT_TYPE.ACCOUNT_RENAMED)
			.firstOrFail();
		assert.equal(event.subjectType, AUDIT_SUBJECT_TYPE.ACCOUNT);
		assert.equal(event.subjectId, user.id);
	});

	test('should leave another account untouched', async ({ assert, client }) => {
		const owner = await createUser({ emailPrefix: 'rename-owner' });
		const bystander = await createUser({ emailPrefix: 'rename-bystander' });

		await client
			.put(RENAME_ROUTE)
			.form({ nickName: 'New Name' })
			.withCsrfToken()
			.loginAs(owner)
			.redirects(0);

		await bystander.refresh();
		assert.notEqual(bystander.nickName, 'New Name');
	});

	test('should reject a blank name', async ({ assert, client }) => {
		const user = await createUser({ emailPrefix: 'rename-blank' });

		await client
			.put(RENAME_ROUTE)
			.form({ nickName: '' })
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		await user.refresh();
		assert.notEqual(user.nickName, '');
	});
});
