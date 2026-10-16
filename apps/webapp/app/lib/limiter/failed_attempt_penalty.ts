import limiter from '@adonisjs/limiter/services/main';

import env from '#start/env';
import type { AttemptTier } from '#lib/limiter/attempt_tiers';
import { deriveAccountThrottleKey } from '#lib/limiter/account_throttle_key';

export type FailedAttemptPenalty = <Outcome>(
	accountEmail: string,
	attempt: () => Promise<Outcome>
) => Promise<Outcome>;

/**
 * Charges the targeted account only when `attempt` throws, and forgets the
 * account's failures once it succeeds. Counting every request instead would let
 * a stranger keep a chosen user's sign-in blocked just by posting their email.
 * An account already over budget is refused before `attempt` runs.
 */
export function defineFailedAttemptPenalty(
	action: string,
	tiers: readonly AttemptTier[]
): FailedAttemptPenalty {
	return async <Outcome>(
		accountEmail: string,
		attempt: () => Promise<Outcome>
	) => {
		const accountKey = deriveAccountThrottleKey(
			accountEmail.trim().toLowerCase(),
			env.get('APP_KEY')
		);
		const tierLimiters = limiter.multi(
			tiers.map((tier) => ({
				key: `${action}_account_${tier.name}_${accountKey}`,
				requests: tier.requests,
				duration: tier.window,
				blockDuration: tier.blockFor,
			}))
		);

		const [throttleError, outcome] =
			await tierLimiters.penalize<Outcome>(attempt);
		if (throttleError) throw throttleError;

		return outcome;
	};
}
