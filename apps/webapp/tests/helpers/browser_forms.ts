import type { Page, Locator } from 'playwright';

type FieldValues = Readonly<Record<string, string>>;

/**
 * `useForm`'s fields are controlled inputs, server-rendered empty because SSR
 * has nothing to fill them with. React's `hydrateRoot` forces every
 * controlled input's DOM value back to that empty state the moment it
 * commits (once, for the whole form at once) so a field filled before that
 * commit is silently wiped, even if it looked "filled" for the fifty
 * milliseconds beforehand. Nothing in the DOM announces when hydration is
 * done, so the whole form is filled and re-checked as one batch, and redone
 * from scratch if any field lost its value.
 *
 * Surviving DOM values are not enough on their own: the commit can still land
 * after the check and wipe them. Both forms keep their submit button disabled
 * while any field is empty, so an enabled button is the one observable proof
 * that React's own state (not just the DOM) holds what was typed.
 */
export async function fillFormOnceHydrated(
	page: Page,
	fields: FieldValues
): Promise<void> {
	const entries = Object.entries(fields);
	const maxAttempts = 20;

	for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
		for (const [name, value] of entries) {
			await page.locator(`input[name="${name}"]`).fill(value);
		}

		await page.waitForTimeout(100);

		const survived = await Promise.all(
			entries.map(
				async ([name, value]) =>
					(await page.locator(`input[name="${name}"]`).inputValue()) === value
			)
		);
		const isSubmitEnabled = await page
			.locator('button[type="submit"]')
			.isEnabled();

		if (survived.every(Boolean) && isSubmitEnabled) {
			return;
		}
	}

	throw new Error('Form kept reverting to its pre-hydration values');
}

const CLICK_MAX_ATTEMPTS = 20;
const DEFAULT_EXPECTED_TIMEOUT_MS = 200;
export const NETWORK_EXPECTED_TIMEOUT_MS = 2000;

/**
 * SSR-rendered buttons exist in the DOM before React has hydrated and attached
 * their `onClick`: a click in that window does nothing, and nothing in the DOM
 * announces when hydration finished. So the click is retried until the thing
 * it should cause (`expected`: an opened dialog, a toast, a badge) shows up.
 * Pass a longer timeout for actions that wait on a network round trip, so a
 * slow response is not mistaken for a swallowed click.
 */
export async function clickOnceHydrated(
	trigger: Locator,
	expected: Locator,
	expectedTimeoutMs: number = DEFAULT_EXPECTED_TIMEOUT_MS
): Promise<void> {
	for (let attempt = 1; attempt <= CLICK_MAX_ATTEMPTS; attempt += 1) {
		await trigger.click();
		const hasAppeared = await expected
			.waitFor({ state: 'visible', timeout: expectedTimeoutMs })
			.then(() => true)
			.catch(() => false);

		if (hasAppeared) return;
	}

	throw new Error(
		`Expected element never appeared after ${CLICK_MAX_ATTEMPTS} clicks`
	);
}

/**
 * Same hydration gap as `clickOnceHydrated`, for handlers bound to hover or
 * focus (tooltips): the pointer is moved off and back on between attempts so
 * each one fires a fresh `mouseenter`.
 */
export async function hoverOnceHydrated(
	trigger: Locator,
	expected: Locator
): Promise<void> {
	for (let attempt = 1; attempt <= CLICK_MAX_ATTEMPTS; attempt += 1) {
		await trigger.hover();
		const hasAppeared = await expected
			.waitFor({ state: 'visible', timeout: DEFAULT_EXPECTED_TIMEOUT_MS })
			.then(() => true)
			.catch(() => false);

		if (hasAppeared) return;

		await trigger.page().mouse.move(0, 0);
	}

	throw new Error(
		`Expected element never appeared after ${CLICK_MAX_ATTEMPTS} hovers`
	);
}
