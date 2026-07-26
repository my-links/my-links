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

type LoginAttemptTier = {
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
} as const satisfies LoginAttemptTier;

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
] as const satisfies readonly LoginAttemptTier[];

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
 * Both dimensions are needed: the address alone lets a botnet spread one
 * account's attempts over thousands of hosts, the account alone lets a single
 * host walk a dictionary of addresses.
 */
const LOGIN_ATTEMPT_DIMENSIONS = {
	address: resolveClientAddress,
	account: resolveTargetedAccount,
} as const;

function defineLoginThrottle(
	dimension: keyof typeof LOGIN_ATTEMPT_DIMENSIONS,
	tier: LoginAttemptTier
): MiddlewareFn {
	const resolveKey = LOGIN_ATTEMPT_DIMENSIONS[dimension];

	return limiter.define(`login_${dimension}_${tier.name}`, (ctx) => {
		const key = resolveKey(ctx);
		if (!key) return limiter.noLimit();

		return limiter
			.allowRequests(tier.requests)
			.every(tier.window)
			.blockFor(tier.blockFor)
			.usingKey(key);
	});
}

export const loginThrottles: MiddlewareFn[] = LOGIN_ATTEMPT_TIERS.flatMap(
	(tier) => [
		defineLoginThrottle('address', tier),
		defineLoginThrottle('account', tier),
	]
);
