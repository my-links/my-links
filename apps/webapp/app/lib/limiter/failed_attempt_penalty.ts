import limiter from '@adonisjs/limiter/services/main';

import type { AttemptTier } from '#lib/limiter/attempt_tiers';

export type PenaltyBudget = {
	readonly dimension: 'account' | 'device';
	readonly key: string;
};

export type FailedAttemptPenalty = <Outcome>(
	budget: PenaltyBudget,
	attempt: () => Promise<Outcome>
) => Promise<Outcome>;

/**
 * Charges the budget only when `attempt` throws, and forgets its failures once
 * it succeeds. Counting every request instead would let a stranger keep a
 * chosen user's sign-in blocked just by posting their email. A budget already
 * over its limit is refused before `attempt` runs.
 */
export function defineFailedAttemptPenalty(
	action: string,
	tiers: readonly AttemptTier[]
): FailedAttemptPenalty {
	return async <Outcome>(
		budget: PenaltyBudget,
		attempt: () => Promise<Outcome>
	) => {
		const tierLimiters = limiter.multi(
			tiers.map((tier) => ({
				key: `${action}_${budget.dimension}_${tier.name}_${budget.key}`,
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
