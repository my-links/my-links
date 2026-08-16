import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import AuditEvent from '#models/audit_event';
import UserSession from '#models/user_session';
import OneTimeToken from '#models/one_time_token';
import { ACCOUNT_ROLE } from '#constants/account';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { AUTH_EVENT_TYPE, ONE_TIME_TOKEN_TYPE } from '#constants/auth';
import { createUserSession } from '#tests/factories/user_session_factory';
import ResetPasswordNotification from '#mails/reset_password_notification';
import { enableOutgoingMail, queuedMails } from '#tests/helpers/outgoing_mail';
import {
	createUser,
	verifyUserEmail,
	requestAccountDeletion,
} from '#tests/factories/user_factory';

const FAVORITES_ROUTE = '/collections/favorites';
const MEMBER_ROLE = ACCOUNT_ROLE.MEMBER;
const ADMINISTRATOR_ROLE = ACCOUNT_ROLE.ADMINISTRATOR;

async function createAdmin(prefix = 'admin'): Promise<User> {
	const user = await createUser({ emailPrefix: prefix });
	user.isAdmin = true;
	await user.save();

	return user;
}

/**
 * The suite runs against a database a developer may have seeded, so "the only
 * administrator left" has to be arranged rather than assumed — otherwise the
 * test describes the machine it runs on instead of the rule. Rolled back with
 * the rest of the transaction.
 */
async function makeSoleAdministrator(user: User): Promise<void> {
	await User.query()
		.where('isAdmin', true)
		.andWhereNot('id', user.id)
		.update({ isAdmin: false });
}

function passwordResetRoute(account: User): string {
	return `/admin/users/${account.id}/password-reset`;
}

function verifyEmailRoute(account: User): string {
	return `/admin/users/${account.id}/verify-email`;
}

function revokeAccessRoute(account: User): string {
	return `/admin/users/${account.id}/revoke-access`;
}

function roleRoute(account: User): string {
	return `/admin/users/${account.id}/role`;
}

function restoreRoute(account: User): string {
	return `/admin/users/${account.id}/restore`;
}

test.group('Admin account actions — sending a reset link', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(enableOutgoingMail);

	test('should mail a reset link to the account', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin();
		const account = await createUser({ emailPrefix: 'reset-target' });

		await client
			.post(passwordResetRoute(account))
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		queuedMails().assertQueued(ResetPasswordNotification);
		const tokens = await OneTimeToken.query()
			.where('userId', account.id)
			.andWhere('type', ONE_TIME_TOKEN_TYPE.PASSWORD_RESET);
		assert.lengthOf(tokens, 1);
	});

	test('should journal the request against the account and name the administrator', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin();
		const account = await createUser({ emailPrefix: 'reset-journal' });

		await client
			.post(passwordResetRoute(account))
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		const events = await AuditEvent.query()
			.where('userId', account.id)
			.andWhere('type', AUTH_EVENT_TYPE.PASSWORD_RESET_REQUESTED);
		assert.equal(events[0]?.actorId, administrator.id);
	});
});

test.group('Admin account actions — without outgoing mail', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should answer 404 when the instance cannot mail a reset link', async ({
		client,
	}) => {
		const administrator = await createAdmin();
		const account = await createUser({ emailPrefix: 'reset-no-mail' });

		const response = await client
			.post(passwordResetRoute(account))
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		response.assertStatus(404);
	});
});

test.group('Admin account actions — confirming an address', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should confirm an address nobody ever proved', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin();
		const account = await createUser({ emailPrefix: 'confirm-target' });

		await client
			.post(verifyEmailRoute(account))
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		await account.refresh();
		assert.isNotNull(account.emailVerifiedAt);
	});

	test('should keep the original date of an address that was already confirmed', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin();
		const account = await createUser({ emailPrefix: 'confirm-again' });
		await verifyUserEmail(account);
		const confirmedAt = account.emailVerifiedAt;

		await client
			.post(verifyEmailRoute(account))
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		await account.refresh();
		assert.equal(account.emailVerifiedAt?.toISO(), confirmedAt?.toISO());
	});
});

test.group('Admin account actions — revoking access', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should sign the account out of every browser', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin();
		const account = await createUser({ emailPrefix: 'revoke-sessions' });
		await createUserSession(account);

		await client
			.post(revokeAccessRoute(account))
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		const remainingSessions = await UserSession.query().where(
			'userId',
			String(account.id)
		);
		assert.isEmpty(remainingSessions);
	});

	test('should drop every extension token of the account', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin();
		const account = await createUser({ emailPrefix: 'revoke-tokens' });
		await User.accessTokens.create(account, undefined, { name: 'Extension' });

		await client
			.post(revokeAccessRoute(account))
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		const remainingTokens = await User.accessTokens.all(account);
		assert.isEmpty(remainingTokens);
	});

	test('should leave another account alone', async ({ assert, client }) => {
		const administrator = await createAdmin();
		const account = await createUser({ emailPrefix: 'revoke-target' });
		const bystander = await createUser({ emailPrefix: 'revoke-bystander' });
		await createUserSession(bystander);

		await client
			.post(revokeAccessRoute(account))
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		const remainingSessions = await UserSession.query().where(
			'userId',
			String(bystander.id)
		);
		assert.lengthOf(remainingSessions, 1);
	});
});

test.group('Admin account actions — changing a role', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should promote a member to administrator', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin();
		const account = await createUser({ emailPrefix: 'promote-target' });

		await client
			.patch(roleRoute(account))
			.form({ role: ADMINISTRATOR_ROLE })
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		await account.refresh();
		assert.isTrue(account.isAdmin);
	});

	test('should demote an administrator while another one remains', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin();
		const account = await createAdmin('demote-target');

		await client
			.patch(roleRoute(account))
			.form({ role: MEMBER_ROLE })
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		await account.refresh();
		assert.isFalse(account.isAdmin);
	});

	test('should refuse to demote the only administrator left', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin('sole-admin');
		await makeSoleAdministrator(administrator);

		await client
			.patch(roleRoute(administrator))
			.form({ role: MEMBER_ROLE })
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		await administrator.refresh();
		assert.isTrue(administrator.isAdmin);
	});

	test('should journal a promotion against the account and name the administrator', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin();
		const account = await createUser({ emailPrefix: 'promote-journal' });

		await client
			.patch(roleRoute(account))
			.form({ role: ADMINISTRATOR_ROLE })
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		const events = await AuditEvent.query()
			.where('userId', account.id)
			.andWhere('type', AUTH_EVENT_TYPE.ROLE_PROMOTED);
		assert.equal(events[0]?.actorId, administrator.id);
	});
});

test.group('Admin account actions — restoring a pending deletion', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should clear the pending deletion, self-service or admin-initiated alike', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin('restore-admin');
		const account = await createUser({ emailPrefix: 'restore-target' });
		await requestAccountDeletion(account);

		await client
			.post(restoreRoute(account))
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		await account.refresh();
		assert.isNull(account.pendingDeletionAt);
		assert.isNull(account.pendingDeletionRequestedById);
	});

	test('should journal the restoration naming the administrator as actor', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin('restore-admin-journal');
		const account = await createUser({ emailPrefix: 'restore-target-journal' });
		await requestAccountDeletion(account, undefined, administrator.id);

		await client
			.post(restoreRoute(account))
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		const event = await AuditEvent.query()
			.where('subjectType', AUDIT_SUBJECT_TYPE.ACCOUNT)
			.andWhere('subjectId', account.id)
			.andWhere('type', ACTIVITY_EVENT_TYPE.ACCOUNT_REACTIVATED)
			.firstOrFail();
		assert.equal(event.actorId, administrator.id);
	});
});

test.group('Admin account actions — reserved to administrators', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should send a signed-in visitor without the admin flag away from a reset', async ({
		client,
	}) => {
		const visitor = await createUser({ emailPrefix: 'not-admin' });
		const account = await createUser({ emailPrefix: 'guarded-reset' });

		const response = await client
			.post(passwordResetRoute(account))
			.withCsrfToken()
			.loginAs(visitor)
			.redirects(0);

		response.assertHeader('location', FAVORITES_ROUTE);
	});

	test('should refuse a role change to a signed-in visitor without the admin flag', async ({
		assert,
		client,
	}) => {
		const visitor = await createUser({ emailPrefix: 'not-admin-role' });
		const account = await createUser({ emailPrefix: 'guarded-role' });

		await client
			.patch(roleRoute(account))
			.form({ role: ADMINISTRATOR_ROLE })
			.withCsrfToken()
			.loginAs(visitor)
			.redirects(0);

		await account.refresh();
		assert.isFalse(account.isAdmin);
	});

	test('should refuse an address confirmation to a signed-in visitor without the admin flag', async ({
		assert,
		client,
	}) => {
		const visitor = await createUser({ emailPrefix: 'not-admin-verify' });
		const account = await createUser({ emailPrefix: 'guarded-verify' });

		await client
			.post(verifyEmailRoute(account))
			.withCsrfToken()
			.loginAs(visitor)
			.redirects(0);

		await account.refresh();
		assert.isNull(account.emailVerifiedAt);
	});

	test('should refuse a revocation to a signed-in visitor without the admin flag', async ({
		assert,
		client,
	}) => {
		const visitor = await createUser({ emailPrefix: 'not-admin-revoke' });
		const account = await createUser({ emailPrefix: 'guarded-revoke' });
		await createUserSession(account);

		await client
			.post(revokeAccessRoute(account))
			.withCsrfToken()
			.loginAs(visitor)
			.redirects(0);

		const remainingSessions = await UserSession.query().where(
			'userId',
			String(account.id)
		);
		assert.lengthOf(remainingSessions, 1);
	});

	test('should refuse a restoration to a signed-in visitor without the admin flag', async ({
		assert,
		client,
	}) => {
		const visitor = await createUser({ emailPrefix: 'not-admin-restore' });
		const account = await createUser({ emailPrefix: 'guarded-restore' });
		await requestAccountDeletion(account);

		await client
			.post(restoreRoute(account))
			.withCsrfToken()
			.loginAs(visitor)
			.redirects(0);

		await account.refresh();
		assert.isNotNull(account.pendingDeletionAt);
	});
});
