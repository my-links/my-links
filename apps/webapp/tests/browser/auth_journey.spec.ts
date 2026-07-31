import { DateTime } from 'luxon';
import { test } from '@japa/runner';
import type { Page } from 'playwright';
import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import OneTimeToken from '#models/one_time_token';
import { ONE_TIME_TOKEN_TYPE } from '#constants/auth';
import { createUser } from '#tests/factories/user_factory';
import { OneTimeTokenService } from '#services/auth/one_time_token_service';
import { UNVERIFIED_EMAIL_MESSAGE } from '#exceptions/auth/unverified_email_exception';
import {
	waitForMailTo,
	resetMailpitInbox,
	extractLinkFromMail,
} from '#tests/helpers/mailpit';

const HOME_PATH = '/';
const LOGIN_PATH = '/login';
const REGISTER_PATH = '/register';
const LOGOUT_PATH = '/auth/logout';
const FAVORITES_PATH = '/collections/favorites';
const VERIFICATION_PATH_PREFIX = '/verify-email/';

const NEW_ACCOUNT_NAME = 'Ada Lovelace';
const VALID_PASSWORD = 'correct-horse-battery-staple';

// Server-flashed, never run through Lingui, so these are the literal
// sentences a browser of any locale sees. `email_verification.spec.ts` and
// `email_verification_gate.spec.ts` assert the same two constants; this file
// hardcodes `CONFIRMED_MESSAGE` and `INVALID_LINK_MESSAGE` the same way those
// specs do, since neither controller exports them.
const CONFIRMED_MESSAGE = 'Your email address is confirmed';
const INVALID_LINK_MESSAGE = 'This link is no longer valid';

let journeyCounter = 0;

function nextJourneyEmail(): string {
	journeyCounter += 1;

	return `browser-journey-${Date.now()}-${journeyCounter}@example.com`;
}

/**
 * Registration is only open on an instance with no accounts yet, and this
 * suite runs against a developer's seeded database — the same trick
 * `registration.spec.ts` uses, safe here because every test runs inside a
 * rolled back transaction.
 */
async function emptyInstance(): Promise<void> {
	await User.query().delete();
}

type FieldValues = Readonly<Record<string, string>>;

/**
 * `useForm`'s fields are controlled inputs, server-rendered empty because SSR
 * has nothing to fill them with. React's `hydrateRoot` forces every
 * controlled input's DOM value back to that empty state the moment it
 * commits — once, for the whole form at once — so a field filled before that
 * commit is silently wiped, even if it looked "filled" for the fifty
 * milliseconds beforehand. Nothing in the DOM announces when hydration is
 * done, so the whole form is filled and re-checked as one batch, and redone
 * from scratch if any field lost its value: the first pass may straddle the
 * commit, but by the second one hydration is certainly finished and every
 * `onChange` is live.
 */
async function fillFormOnceHydrated(
	page: Page,
	fields: FieldValues
): Promise<void> {
	const entries = Object.entries(fields);
	const maxAttempts = 10;

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

		if (survived.every(Boolean)) {
			return;
		}
	}

	throw new Error('Form kept reverting to its pre-hydration values');
}

async function submitCredentials(
	page: Page,
	email: string,
	password: string
): Promise<void> {
	await fillFormOnceHydrated(page, { email, password });
	await page.locator('button[type="submit"]').click();
}

test.group('Auth journey (browser)', (group) => {
	// Shared across every local run, including manual poking through
	// mailpit's own UI — a search scoped to a unique recipient is not enough
	// on its own to keep the inbox from growing without bound.
	group.setup(() => resetMailpitInbox());
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test('should carry a new account through registration, mail confirmation, and password sign-in', async ({
		visit,
	}) => {
		await emptyInstance();
		const email = nextJourneyEmail();

		// 1. On an empty instance, registration is open and Google is not
		// configured for this suite — the home page offers only credentials.
		const page = await visit(HOME_PATH);
		await page.assertExists('a[href="/register"]');
		await page.assertNotExists('a[href="/auth/google"]');

		await page.goto(REGISTER_PATH);
		await fillFormOnceHydrated(page, {
			name: NEW_ACCOUNT_NAME,
			email,
			password: VALID_PASSWORD,
			passwordConfirmation: VALID_PASSWORD,
		});
		await page.locator('button[type="submit"]').click();

		await page.assertPath(LOGIN_PATH);
		await page.assertVisible('[role="status"]');

		// The phase 8b gate: the right password on an unconfirmed address
		// still refuses, and says so without pretending it was wrong.
		await submitCredentials(page, email, VALID_PASSWORD);
		await page.assertPath(LOGIN_PATH);
		await page.assertText('[role="alert"]', UNVERIFIED_EMAIL_MESSAGE);

		// 2. mailpit received the link `mail.sendLater()` queued.
		const verificationMail = await waitForMailTo(email);
		const verificationHref = extractLinkFromMail(
			verificationMail,
			VERIFICATION_PATH_PREFIX
		);
		const verificationPath = new URL(verificationHref).pathname;

		// 3. Following it confirms the address.
		await page.goto(verificationPath);
		await page.assertPath(LOGIN_PATH);
		await page.assertText('[role="status"]', CONFIRMED_MESSAGE);

		// 4. Sign in, then out, then in again.
		await submitCredentials(page, email, VALID_PASSWORD);
		await page.assertPath(FAVORITES_PATH);

		// The desktop and mobile navs both render a logout link; only one is
		// visible at this viewport, but both are in the DOM.
		await page.locator(`a[href="${LOGOUT_PATH}"]`).first().click();
		await page.assertPath(HOME_PATH);
		await page.assertExists('a[href="/login"]');

		await page.goto(LOGIN_PATH);
		await submitCredentials(page, email, VALID_PASSWORD);
		await page.assertPath(FAVORITES_PATH);

		// 5. Registration closed the moment the first account landed, and
		// Google is still off — the home page reflects both.
		await page.goto(HOME_PATH);
		await page.assertNotExists('a[href="/register"]');
		await page.assertNotExists('a[href="/auth/google"]');
		await page.assertExists('a[href="/login"]');

		// 6. The link is single-use: visiting it again refuses onto a
		// readable page instead of re-confirming or crashing.
		await page.goto(verificationPath);
		await page.assertPath(HOME_PATH);
		await page.assertText('[role="alert"]', INVALID_LINK_MESSAGE);
	});

	test('should refuse an expired verification link onto a readable page', async ({
		visit,
	}) => {
		const user = await createUser({ emailPrefix: 'browser-expired' });
		const oneTimeTokenService = await app.container.make(OneTimeTokenService);
		const { secret } = await oneTimeTokenService.issue({
			userId: user.id,
			type: ONE_TIME_TOKEN_TYPE.EMAIL_VERIFICATION,
		});
		await OneTimeToken.query()
			.where('userId', user.id)
			.update({ expires_at: DateTime.now().minus({ hours: 1 }).toSQL() });

		const page = await visit(`${VERIFICATION_PATH_PREFIX}${secret.release()}`);

		await page.assertPath(HOME_PATH);
		await page.assertText('[role="alert"]', INVALID_LINK_MESSAGE);
	});
});
