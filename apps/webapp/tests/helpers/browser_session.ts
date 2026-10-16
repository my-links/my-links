import type { Page } from 'playwright';

import { fillFormOnceHydrated } from '#tests/helpers/browser_forms';
import { nextClientAddress } from '#tests/helpers/client_addresses';

const LOGIN_PATH = '/login';
const INBOX_PATH = '/collections/inbox';

// The dashboard tour's welcome modal offers itself to any account that
// hasn't completed it, and sits on top of everything a fresh login lands
// on: blocking the very first click these specs make. Seed the tour
// store's persisted flag before the app boots so it never renders.
export async function skipDashboardTour(page: Page): Promise<void> {
	await page.addInitScript(() => {
		localStorage.setItem(
			'tour-preferences',
			JSON.stringify({ state: { hasCompletedDashboardTour: true }, version: 0 })
		);
	});
}

export async function submitLoginForm(
	page: Page,
	email: string,
	password: string
): Promise<void> {
	// The login throttle's memory store outlives a rolled back transaction, and
	// several specs in this suite log in for real: a shared address would let
	// one test's attempt spend another's budget.
	await page.setExtraHTTPHeaders({ 'x-forwarded-for': nextClientAddress() });
	await page.goto(LOGIN_PATH);
	await fillFormOnceHydrated(page, { email, password });
	await page.locator('button[type="submit"]').click();
}

export async function loginAsUser(
	page: Page,
	email: string,
	password: string
): Promise<void> {
	await skipDashboardTour(page);
	await submitLoginForm(page, email, password);
	await page.assertPath(INBOX_PATH);
}
