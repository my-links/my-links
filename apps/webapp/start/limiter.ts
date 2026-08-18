/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import { createHash } from 'node:crypto';
import limiter from '@adonisjs/limiter/services/main';
import type { HttpContext } from '@adonisjs/core/http';
import type { MiddlewareFn } from '@adonisjs/core/types/http';

/**
 * Applied to every `/api/v1/*` route (extension today, any future API
 * client tomorrow). Keyed per authenticated user so all of a user's
 * devices/tabs share one budget, falling back to IP for the one
 * unauthenticated route (`/api/v1/health`). The limit sits far above what
 * the extension's background worker ever needs — a 5-minute sync alarm plus
 * wake triggers (tab switch, window focus), always deduped to a single
 * in-flight request — so it only ever catches a runaway client, never
 * normal usage. This protects small self-hosted instances, not the
 * extension itself.
 */
export const apiThrottle = limiter.define('api', (ctx) => {
	return limiter
		.allowRequests(300)
		.every('1 minute')
		.usingKey(ctx.auth.user?.id ?? ctx.request.ip());
});

/**
 * A separate bucket from `apiThrottle`, keyed the same way but tracked under
 * its own name — an agent looping through MCP tool calls spends its own
 * budget instead of the one the browser extension shares across a user's
 * devices. Same ceiling as `apiThrottle` today; the point of splitting it is
 * isolation, not a different number.
 */
export const mcpThrottle = limiter.define('mcp', (ctx) => {
	return limiter
		.allowRequests(300)
		.every('1 minute')
		.usingKey(ctx.auth.user?.id ?? ctx.request.ip());
});

type AttemptTier = {
	readonly name: string;
	readonly requests: number;
	readonly window: string;
	readonly blockFor: string;
};

/**
 * The tier a human mistyping their password runs into first. Exported so a
 * spec asserts against the configured budget instead of a copy of it.
 */
export const LOGIN_BURST_TIER = {
	name: 'burst',
	requests: 5,
	window: '1 minute',
	blockFor: '1 minute',
} as const satisfies AttemptTier;

/**
 * Stacked windows, each blocking longer than the last. Fixed-window limiters
 * cannot grow a penalty on their own, so the escalation is expressed by
 * layering them: keep failing past the burst budget and the sustained tier
 * takes over, then the persistent one. Blocking is deliberately the only
 * consequence — locking the account itself would hand any stranger a way to
 * shut a chosen user out of their own instance.
 */
const LOGIN_ATTEMPT_TIERS = [
	LOGIN_BURST_TIER,
	{
		name: 'sustained',
		requests: 20,
		window: '15 minutes',
		blockFor: '15 minutes',
	},
	{ name: 'persistent', requests: 50, window: '1 hour', blockFor: '1 hour' },
] as const satisfies readonly AttemptTier[];

/**
 * Registration is the other unauthenticated write, and the one an address
 * harvester would walk to find out which emails already have an account. The
 * budget is smaller than the sign-in one because nobody legitimately creates
 * three accounts in ten minutes.
 */
export const REGISTRATION_BURST_TIER = {
	name: 'burst',
	requests: 3,
	window: '10 minutes',
	blockFor: '10 minutes',
} as const satisfies AttemptTier;

const REGISTRATION_ATTEMPT_TIERS = [
	REGISTRATION_BURST_TIER,
	{ name: 'sustained', requests: 10, window: '1 hour', blockFor: '1 hour' },
] as const satisfies readonly AttemptTier[];

/**
 * Guessing a 256-bit token is not a threat anyone can carry out, so the budget
 * is here to keep the endpoint from being a free way to spend an instance's
 * database and CPU — hence a ceiling well above what following a link from a
 * mailbox costs, prefetching mail clients included.
 */
export const TOKEN_VERIFICATION_BURST_TIER = {
	name: 'burst',
	requests: 20,
	window: '10 minutes',
	blockFor: '10 minutes',
} as const satisfies AttemptTier;

const TOKEN_VERIFICATION_TIERS = [
	TOKEN_VERIFICATION_BURST_TIER,
	{ name: 'sustained', requests: 60, window: '1 hour', blockFor: '1 hour' },
] as const satisfies readonly AttemptTier[];

/**
 * The budget of the flows where a visitor types an address and the instance
 * mails a link to it — asking for a password reset, asking for a fresh
 * confirmation link. Sending is free for whoever asks and costs the instance a
 * mail, so the budget is about stopping someone from walking a list of
 * addresses to spray; the ceiling is well above what a person who mistypes
 * their own address twice ever needs.
 *
 * The tiers are shared, the budgets are not: each flow defines its own
 * throttle, so spending one does not spend the other.
 */
export const MAILED_LINK_REQUEST_BURST_TIER = {
	name: 'burst',
	requests: 5,
	window: '15 minutes',
	blockFor: '15 minutes',
} as const satisfies AttemptTier;

const MAILED_LINK_REQUEST_TIERS = [
	MAILED_LINK_REQUEST_BURST_TIER,
	{ name: 'sustained', requests: 15, window: '1 hour', blockFor: '1 hour' },
] as const satisfies readonly AttemptTier[];

/**
 * Confirming sudo mode is a password prompt behind a session, so it is a
 * guessing surface like sign-in — and a tighter one, since the account is
 * already picked and only its owner should ever be typing here.
 */
export const SUDO_CONFIRMATION_BURST_TIER = {
	name: 'burst',
	requests: 5,
	window: '5 minutes',
	blockFor: '5 minutes',
} as const satisfies AttemptTier;

const SUDO_CONFIRMATION_TIERS = [
	SUDO_CONFIRMATION_BURST_TIER,
	{ name: 'sustained', requests: 20, window: '1 hour', blockFor: '1 hour' },
] as const satisfies readonly AttemptTier[];

/**
 * Asking to move an account to another address costs two mails and sits behind
 * a session, so the budget only has to stop a signed-in account from spraying
 * confirmation links at addresses it does not own.
 */
export const EMAIL_CHANGE_REQUEST_BURST_TIER = {
	name: 'burst',
	requests: 5,
	window: '15 minutes',
	blockFor: '15 minutes',
} as const satisfies AttemptTier;

const EMAIL_CHANGE_REQUEST_TIERS = [
	EMAIL_CHANGE_REQUEST_BURST_TIER,
	{ name: 'sustained', requests: 15, window: '1 hour', blockFor: '1 hour' },
] as const satisfies readonly AttemptTier[];

function resolveClientAddress(ctx: HttpContext): string {
	return ctx.request.ip();
}

/**
 * Digests the address so the rate-limit table never holds a list of the
 * emails people tried to sign in with.
 */
function resolveTargetedAccount(ctx: HttpContext): string | null {
	const submittedEmail: unknown = ctx.request.input('email');
	if (typeof submittedEmail !== 'string') return null;

	const normalizedEmail = submittedEmail.trim().toLowerCase();
	if (!normalizedEmail) return null;

	return createHash('sha256').update(normalizedEmail).digest('hex');
}

/**
 * The signed-in account itself, for the throttles that sit behind a session.
 * Unlike `account`, nothing attacker-supplied picks this key, so it cannot be
 * used to spend somebody else's budget.
 */
function resolveAuthenticatedAccount(ctx: HttpContext): string | null {
	const authenticatedUser = ctx.auth.user;

	return authenticatedUser ? String(authenticatedUser.id) : null;
}

const ATTEMPT_DIMENSIONS = {
	address: resolveClientAddress,
	account: resolveTargetedAccount,
	actor: resolveAuthenticatedAccount,
} as const;

type AttemptDimension = keyof typeof ATTEMPT_DIMENSIONS;

function defineAttemptThrottle(
	action: string,
	dimension: AttemptDimension,
	tier: AttemptTier
): MiddlewareFn {
	const resolveKey = ATTEMPT_DIMENSIONS[dimension];

	return limiter.define(`${action}_${dimension}_${tier.name}`, (ctx) => {
		const key = resolveKey(ctx);
		if (!key) return limiter.noLimit();

		return limiter
			.allowRequests(tier.requests)
			.every(tier.window)
			.blockFor(tier.blockFor)
			.usingKey(key);
	});
}

function defineAttemptThrottles(
	action: string,
	tiers: readonly AttemptTier[],
	dimensions: readonly AttemptDimension[]
): MiddlewareFn[] {
	return tiers.flatMap((tier) =>
		dimensions.map((dimension) =>
			defineAttemptThrottle(action, dimension, tier)
		)
	);
}

/**
 * Both dimensions are needed on sign-in: the address alone lets a botnet spread
 * one account's attempts over thousands of hosts, the account alone lets a
 * single host walk a dictionary of addresses.
 */
export const loginThrottles: MiddlewareFn[] = defineAttemptThrottles(
	'login',
	LOGIN_ATTEMPT_TIERS,
	['address', 'account']
);

/**
 * Sign-up is throttled by address only. Keying it on the submitted email too
 * would let anyone burn a chosen address's budget and keep its owner from ever
 * registering — and it would buy nothing, since a harvester walks a different
 * address on every request anyway.
 */
export const registrationThrottles: MiddlewareFn[] = defineAttemptThrottles(
	'registration',
	REGISTRATION_ATTEMPT_TIERS,
	['address']
);

/**
 * Guards the routes that redeem a one-time link. Address only: the token is the
 * whole request, so there is no account to key on until it has been resolved.
 */
export const tokenVerificationThrottles: MiddlewareFn[] =
	defineAttemptThrottles('token_verification', TOKEN_VERIFICATION_TIERS, [
		'address',
	]);

/**
 * Address only, for the reason sign-up is: keying on the submitted email would
 * hand anyone a way to keep a chosen account from ever recovering itself.
 */
export const passwordResetRequestThrottles: MiddlewareFn[] =
	defineAttemptThrottles('password_reset_request', MAILED_LINK_REQUEST_TIERS, [
		'address',
	]);

/**
 * Asking for a fresh confirmation link, throttled like the reset request it
 * mirrors and for the same reason: keying on the submitted address would let
 * anyone keep a chosen account from ever confirming itself.
 */
export const VERIFICATION_RESEND_BURST_TIER = MAILED_LINK_REQUEST_BURST_TIER;

export const verificationResendThrottles: MiddlewareFn[] =
	defineAttemptThrottles('verification_resend', MAILED_LINK_REQUEST_TIERS, [
		'address',
	]);

/**
 * Keyed on the signed-in account as well as the address, so a stolen session
 * cannot spread its guesses across hosts.
 */
export const sudoConfirmationThrottles: MiddlewareFn[] = defineAttemptThrottles(
	'sudo_confirmation',
	SUDO_CONFIRMATION_TIERS,
	['address', 'actor']
);

/**
 * Keyed on the signed-in account as well as the address. Never on the submitted
 * address: that one is attacker-supplied, and keying on it would let anyone
 * spend the budget of an address they merely typed.
 */
export const emailChangeRequestThrottles: MiddlewareFn[] =
	defineAttemptThrottles('email_change_request', EMAIL_CHANGE_REQUEST_TIERS, [
		'address',
		'actor',
	]);
