import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';

import { INVALID_CREDENTIALS_MESSAGE } from '#services/auth/credentials_auth_service';
import {
	createUser,
	verifyUserEmail,
	setUserPassword,
	requestAccountDeletion,
} from '#tests/factories/user_factory';
import {
	clickOnceHydrated,
	NETWORK_EXPECTED_TIMEOUT_MS,
} from '#tests/helpers/browser_forms';
import {
	skipDashboardTour,
	submitLoginForm,
} from '#tests/helpers/browser_session';
import {
	ERROR_TOAST_SELECTOR,
	SUCCESS_TOAST_SELECTOR,
} from '#tests/helpers/browser_toasts';
import { waitForMailTo, resetMailpitInbox } from '#tests/helpers/mailpit';

const LOGIN_PATH = '/login';
const HOME_PATH = '/';
const SETTINGS_PATH = '/user/settings';
const REACTIVATE_PATH = '/reactivate';
const INBOX_PATH = '/collections/inbox';
const DECLINED_MESSAGE = 'Your account stays scheduled for deletion';
const VALID_PASSWORD = 'correct-horse-battery-staple';

test.group('Account deletion journey (browser)', (group) => {
	group.setup(() => resetMailpitInbox());
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should carry a self-service deletion through the confirmation mail and back in via reactivation', async ({
		visit,
		assert,
	}) => {
		const user = await createUser({
			emailPrefix: 'browser-deletion',
			name: 'Grace Hopper',
		});
		await verifyUserEmail(user);
		await setUserPassword(user, VALID_PASSWORD);

		const page = await visit(LOGIN_PATH);
		await skipDashboardTour(page);
		await submitLoginForm(page, user.email, VALID_PASSWORD);
		await page.assertPath(INBOX_PATH);

		// 1. Delete the account from the settings page: the trigger opens a
		// confirmation modal, and its own button carries the same label, so
		// the confirm click is scoped to the dialog to disambiguate.
		await page.goto(SETTINGS_PATH);
		await clickOnceHydrated(
			page.getByRole('button', { name: 'Delete Account' }).first(),
			page.getByRole('dialog')
		);
		await page
			.getByRole('dialog')
			.getByRole('button', { name: 'Delete Account' })
			.click();
		await page.assertPath(HOME_PATH);

		// 2. The confirmation mail actually reached mailpit.
		const mail = await waitForMailTo(user.email);
		assert.equal(mail.Subject, 'Your account is scheduled for deletion');

		// 3. Logging back in during the grace period does not silently
		// restore the account: it lands on the reactivation prompt instead.
		await submitLoginForm(page, user.email, VALID_PASSWORD);
		await page.assertPath(REACTIVATE_PATH);

		// 4. Confirming cancels the deletion and opens a real session.
		await page
			.getByRole('button', { name: 'Log in and cancel deletion' })
			.click();
		await page.assertPath(INBOX_PATH);
	});

	test('should keep the deletion scheduled and stay signed out when the reactivation prompt is declined', async ({
		visit,
	}) => {
		const user = await createUser({ emailPrefix: 'browser-decline' });
		await verifyUserEmail(user);
		await setUserPassword(user, VALID_PASSWORD);
		await requestAccountDeletion(user);

		const page = await visit(LOGIN_PATH);
		await skipDashboardTour(page);
		await submitLoginForm(page, user.email, VALID_PASSWORD);
		await page.assertPath(REACTIVATE_PATH);

		await clickOnceHydrated(
			page.getByRole('button', { name: 'No, keep it scheduled for deletion' }),
			page.locator(SUCCESS_TOAST_SELECTOR),
			NETWORK_EXPECTED_TIMEOUT_MS
		);
		await page.assertPath(LOGIN_PATH);
		await page.assertText(SUCCESS_TOAST_SELECTOR, DECLINED_MESSAGE);

		await page.goto(INBOX_PATH);
		await page.assertPath(LOGIN_PATH);
	});

	test('should refuse to sign in an account an administrator scheduled for deletion', async ({
		visit,
	}) => {
		const administrator = await createUser({ emailPrefix: 'browser-admin' });
		administrator.isAdmin = true;
		await administrator.save();
		const user = await createUser({ emailPrefix: 'browser-admin-deleted' });
		await verifyUserEmail(user);
		await setUserPassword(user, VALID_PASSWORD);
		await requestAccountDeletion(user, DateTime.now(), administrator.id);

		const page = await visit(LOGIN_PATH);
		await skipDashboardTour(page);
		await submitLoginForm(page, user.email, VALID_PASSWORD);

		await page.waitForSelector(ERROR_TOAST_SELECTOR);
		await page.assertPath(LOGIN_PATH);
		await page.assertText(ERROR_TOAST_SELECTOR, INVALID_CREDENTIALS_MESSAGE);
	});
});
