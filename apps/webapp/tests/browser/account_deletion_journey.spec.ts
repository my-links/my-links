import { test } from '@japa/runner';
import type { Page } from 'playwright';
import testUtils from '@adonisjs/core/services/test_utils';

import { fillFormOnceHydrated } from '#tests/helpers/browser_forms';
import { nextClientAddress } from '#tests/helpers/client_addresses';
import { waitForMailTo, resetMailpitInbox } from '#tests/helpers/mailpit';
import {
	createUser,
	verifyUserEmail,
	setUserPassword,
} from '#tests/factories/user_factory';

const LOGIN_PATH = '/login';
const HOME_PATH = '/';
const SETTINGS_PATH = '/user/settings';
const REACTIVATE_PATH = '/reactivate';
const FAVORITES_PATH = '/collections/favorites';
const VALID_PASSWORD = 'correct-horse-battery-staple';

// The dashboard tour's welcome modal offers itself to any account that
// hasn't completed it, and sits on top of everything a fresh login lands
// on — same reason `auth_journey.spec.ts` and `dashboard_reordering.spec.ts`
// seed this before any navigation that could reach the dashboard.
async function skipDashboardTour(page: Page): Promise<void> {
	await page.addInitScript(() => {
		localStorage.setItem(
			'tour-preferences',
			JSON.stringify({ state: { hasCompletedDashboardTour: true }, version: 0 })
		);
	});
}

async function submitLogin(
	page: Page,
	email: string,
	password: string
): Promise<void> {
	// The login throttle's memory store outlives a rolled back transaction,
	// and this journey signs in twice — a shared address would let the second
	// attempt spend the first one's burst budget.
	await page.setExtraHTTPHeaders({ 'x-forwarded-for': nextClientAddress() });
	await page.goto(LOGIN_PATH);
	await fillFormOnceHydrated(page, { email, password });
	await page.locator('button[type="submit"]').click();
}

/**
 * The settings page is SSR-rendered, so the button that opens the delete
 * modal exists in the DOM before React has hydrated and attached its
 * `onClick` — a click that lands in that window does nothing. There is no
 * DOM signal for "hydration finished" here (same problem
 * `fillFormOnceHydrated` works around for form fields), so this retries the
 * click until the dialog it should open actually shows up.
 */
async function openDeleteAccountModal(page: Page): Promise<void> {
	const trigger = page.getByRole('button', { name: 'Delete Account' }).first();
	const dialog = page.getByRole('dialog');
	const maxAttempts = 20;

	for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
		await trigger.click();
		const opened = await dialog
			.waitFor({ state: 'visible', timeout: 200 })
			.then(() => true)
			.catch(() => false);

		if (opened) return;
	}

	throw new Error('Delete Account dialog never opened after repeated clicks');
}

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
		await submitLogin(page, user.email, VALID_PASSWORD);
		await page.assertPath(FAVORITES_PATH);

		// 1. Delete the account from the settings page — the trigger opens a
		// confirmation modal, and its own button carries the same label, so
		// the confirm click is scoped to the dialog to disambiguate.
		await page.goto(SETTINGS_PATH);
		await openDeleteAccountModal(page);
		await page
			.getByRole('dialog')
			.getByRole('button', { name: 'Delete Account' })
			.click();
		await page.assertPath(HOME_PATH);

		// 2. The confirmation mail actually reached mailpit.
		const mail = await waitForMailTo(user.email);
		assert.equal(mail.Subject, 'Your account is scheduled for deletion');

		// 3. Logging back in during the grace period does not silently
		// restore the account — it lands on the reactivation prompt instead.
		await submitLogin(page, user.email, VALID_PASSWORD);
		await page.assertPath(REACTIVATE_PATH);

		// 4. Confirming cancels the deletion and opens a real session.
		await page
			.getByRole('button', { name: 'Log in and cancel deletion' })
			.click();
		await page.assertPath(FAVORITES_PATH);
	});
});
