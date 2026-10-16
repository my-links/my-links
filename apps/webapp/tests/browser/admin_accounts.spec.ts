import { DateTime } from 'luxon';
import { test } from '@japa/runner';
import type { Page, Locator } from 'playwright';
import testUtils from '@adonisjs/core/services/test_utils';

import type User from '#models/user';
import { resetMailpitInbox } from '#tests/helpers/mailpit';
import { loginAsUser, submitLoginForm } from '#tests/helpers/browser_session';
import { INVALID_CREDENTIALS_MESSAGE } from '#services/auth/credentials_auth_service';
import { ACCOUNT_RESTORED_MESSAGE } from '#controllers/admin/restore_account_controller';
import {
	ERROR_TOAST_SELECTOR,
	SUCCESS_TOAST_SELECTOR,
} from '#tests/helpers/browser_toasts';
import {
	clickOnceHydrated,
	hoverOnceHydrated,
	NETWORK_EXPECTED_TIMEOUT_MS,
} from '#tests/helpers/browser_forms';
import {
	createUser,
	verifyUserEmail,
	setUserPassword,
	requestAccountDeletion,
} from '#tests/factories/user_factory';

const ADMIN_PATH = '/admin';
const LOGIN_PATH = '/login';
const INBOX_PATH = '/collections/inbox';
const VALID_PASSWORD = 'correct-horse-battery-staple';
const SEARCH_PLACEHOLDER = /^Search by any field/;
const ADMIN_ONLY_MESSAGE = 'This area is reserved to administrators';

const PENDING_DELETION_BADGE = 'Pending deletion';
const PENDING_ROW_TINT = /bg-red-50\/60/;
const DELETE_LABEL = 'Delete account';
const RESTORE_LABEL = 'Cancel the pending deletion';
const ROW_ACTION_LABELS: string[] = [
	DELETE_LABEL,
	'Revoke every session and token',
	'Promote to administrator',
	'Mark the address as confirmed',
	'Send a password reset link',
];

let accountCounter = 0;

async function createAdmin(): Promise<User> {
	const administrator = await createUser({ emailPrefix: 'browser-admin' });
	administrator.isAdmin = true;
	await administrator.save();
	await verifyUserEmail(administrator);
	await setUserPassword(administrator, VALID_PASSWORD);

	return administrator;
}

/**
 * The table lists every account of a possibly seeded database, so each target
 * gets a name no other row carries, to filter on.
 */
async function createTarget(): Promise<User> {
	accountCounter += 1;

	return createUser({
		emailPrefix: 'browser-target',
		name: `Zxq Target ${Date.now()}-${accountCounter}`,
	});
}

async function openAdminAccounts(
	page: Page,
	administrator: User,
	filter: string
): Promise<void> {
	await loginAsUser(page, administrator.email, VALID_PASSWORD);
	await page.goto(ADMIN_PATH);
	await page.getByPlaceholder(SEARCH_PLACEHOLDER).fill(filter);
}

function rowOf(page: Page, target: User): Locator {
	return page.getByRole('row').filter({ hasText: target.fullname });
}

function badgeIn(row: Locator): Locator {
	return row.getByText(PENDING_DELETION_BADGE);
}

async function confirmInDialog(page: Page): Promise<void> {
	await page
		.getByRole('dialog')
		.getByRole('button', { name: 'Delete' })
		.click();
}

test.group('Admin accounts table (browser)', (group) => {
	group.setup(() => resetMailpitInbox());
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should flag the row as pending deletion after an administrator deletes the account', async ({
		visit,
		assert,
	}) => {
		const target = await createTarget();
		const administrator = await createAdmin();
		const page = await visit(LOGIN_PATH);
		await openAdminAccounts(page, administrator, target.fullname);
		const row = rowOf(page, target);

		await clickOnceHydrated(
			row.getByRole('button', { name: DELETE_LABEL }),
			page.getByRole('dialog')
		);
		await confirmInDialog(page);

		await badgeIn(row).waitFor({ state: 'visible' });
		assert.match((await row.getAttribute('class')) ?? '', PENDING_ROW_TINT);
		await row.getByRole('button', { name: RESTORE_LABEL }).waitFor();
	});

	test('should clear the badge and bring back the delete button when an administrator restores the account', async ({
		visit,
	}) => {
		const administrator = await createAdmin();
		const target = await createTarget();
		await requestAccountDeletion(target, DateTime.now(), administrator.id);
		const page = await visit(LOGIN_PATH);
		await openAdminAccounts(page, administrator, target.fullname);
		const row = rowOf(page, target);

		await clickOnceHydrated(
			row.getByRole('button', { name: RESTORE_LABEL }),
			page.locator(SUCCESS_TOAST_SELECTOR),
			NETWORK_EXPECTED_TIMEOUT_MS
		);

		await page.assertText(SUCCESS_TOAST_SELECTOR, ACCOUNT_RESTORED_MESSAGE);
		await badgeIn(row).waitFor({ state: 'detached' });
		await row.getByRole('button', { name: DELETE_LABEL }).waitFor();
	});

	test('should lock the account out once an administrator deleted it from the dashboard', async ({
		visit,
	}) => {
		const target = await createTarget();
		await verifyUserEmail(target);
		await setUserPassword(target, VALID_PASSWORD);
		const administrator = await createAdmin();
		const page = await visit(LOGIN_PATH);
		await openAdminAccounts(page, administrator, target.fullname);
		const row = rowOf(page, target);
		await clickOnceHydrated(
			row.getByRole('button', { name: DELETE_LABEL }),
			page.getByRole('dialog')
		);
		await confirmInDialog(page);
		await badgeIn(row).waitFor({ state: 'visible' });

		await page.context().clearCookies();
		await submitLoginForm(page, target.email, VALID_PASSWORD);

		await page.waitForSelector(ERROR_TOAST_SELECTOR);
		await page.assertPath(LOGIN_PATH);
		await page.assertText(ERROR_TOAST_SELECTOR, INVALID_CREDENTIALS_MESSAGE);
	});

	test('should disable every selected account through the bulk delete', async ({
		visit,
	}) => {
		const namePrefix = `Zxq Bulk ${Date.now()}`;
		const first = await createUser({ name: `${namePrefix} One` });
		const second = await createUser({ name: `${namePrefix} Two` });
		const administrator = await createAdmin();
		const page = await visit(LOGIN_PATH);
		await openAdminAccounts(page, administrator, namePrefix);

		await page
			.getByRole('checkbox', { name: `Select user ${first.fullname}` })
			.check({ force: true });
		await page
			.getByRole('checkbox', { name: `Select user ${second.fullname}` })
			.check({ force: true });
		await clickOnceHydrated(
			page.getByRole('button', { name: 'Delete selected (2)' }),
			page.getByRole('dialog')
		);
		await confirmInDialog(page);

		await badgeIn(rowOf(page, first)).waitFor({ state: 'visible' });
		await badgeIn(rowOf(page, second)).waitFor({ state: 'visible' });
	});

	test('should show the row action tooltip when its button is hovered')
		.with(ROW_ACTION_LABELS)
		.run(async ({ visit }, label) => {
			const target = await createTarget();
			const administrator = await createAdmin();
			const page = await visit(LOGIN_PATH);
			await openAdminAccounts(page, administrator, target.fullname);
			const button = rowOf(page, target).getByRole('button', { name: label });

			await hoverOnceHydrated(
				button,
				page.getByRole('tooltip', { name: label })
			);
		});

	test('should turn a non-administrator away from the admin dashboard', async ({
		visit,
	}) => {
		const member = await createUser({ emailPrefix: 'browser-member' });
		await verifyUserEmail(member);
		await setUserPassword(member, VALID_PASSWORD);
		const page = await visit(LOGIN_PATH);
		await loginAsUser(page, member.email, VALID_PASSWORD);

		await page.goto(ADMIN_PATH);

		await page.assertPath(INBOX_PATH);
		await page.assertText(ERROR_TOAST_SELECTOR, ADMIN_ONLY_MESSAGE);
	});
});
