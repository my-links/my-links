import type { Page } from 'playwright';

type FieldValues = Readonly<Record<string, string>>;

/**
 * `useForm`'s fields are controlled inputs, server-rendered empty because SSR
 * has nothing to fill them with. React's `hydrateRoot` forces every
 * controlled input's DOM value back to that empty state the moment it
 * commits — once, for the whole form at once — so a field filled before that
 * commit is silently wiped, even if it looked "filled" for the fifty
 * milliseconds beforehand. Nothing in the DOM announces when hydration is
 * done, so the whole form is filled and re-checked as one batch, and redone
 * from scratch if any field lost its value.
 *
 * Surviving DOM values are not enough on their own: the commit can still land
 * after the check and wipe them. Both forms keep their submit button disabled
 * while any field is empty, so an enabled button is the one observable proof
 * that React's own state — not just the DOM — holds what was typed.
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
