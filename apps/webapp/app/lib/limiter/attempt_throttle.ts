import limiter from '@adonisjs/limiter/services/main';
import type { HttpContext } from '@adonisjs/core/http';
import type { MiddlewareFn } from '@adonisjs/core/types/http';

import env from '#start/env';
import type { AttemptTier } from '#lib/limiter/attempt_tiers';
import { deriveAccountThrottleKey } from '#lib/limiter/account_throttle_key';

function resolveClientAddress(ctx: HttpContext): string {
	return ctx.request.ip();
}

/**
 * Keys the address by an HMAC so the rate-limit table never holds a list of the
 * emails people tried to sign in with.
 */
function resolveTargetedAccount(ctx: HttpContext): string | null {
	const submittedEmail: unknown = ctx.request.input('email');
	if (typeof submittedEmail !== 'string') return null;

	const normalizedEmail = submittedEmail.trim().toLowerCase();
	if (!normalizedEmail) return null;

	return deriveAccountThrottleKey(normalizedEmail, env.get('APP_KEY'));
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

export type AttemptDimension = keyof typeof ATTEMPT_DIMENSIONS;

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

export function defineAttemptThrottles(
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
