import limiter from '@adonisjs/limiter/services/main';
import type { HttpContext } from '@adonisjs/core/http';
import type { MiddlewareFn } from '@adonisjs/core/types/http';

import type { AttemptTier } from '#lib/limiter/attempt_tiers';

function resolveClientAddress(ctx: HttpContext): string {
	return ctx.request.ip();
}

/**
 * The signed-in account itself, for the throttles that sit behind a session.
 * Nothing attacker-supplied picks this key, so it cannot be used to spend
 * somebody else's budget.
 */
function resolveAuthenticatedAccount(ctx: HttpContext): string | null {
	const authenticatedUser = ctx.auth.user;

	return authenticatedUser ? String(authenticatedUser.id) : null;
}

const ATTEMPT_DIMENSIONS = {
	address: resolveClientAddress,
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
