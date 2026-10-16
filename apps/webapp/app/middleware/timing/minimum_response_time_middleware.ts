import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';

import env from '#start/env';
import {
	padToMinimumDuration,
	SYSTEM_CLOCK,
} from '#lib/timing/minimum_duration';

/**
 * Longer than the slowest branch of the account lookup flows (an argon2 hash
 * plus a few queries and a queued mail) so every branch lands on the same
 * time. `ACCOUNT_LOOKUP_MIN_RESPONSE_MS` overrides it.
 */
export const DEFAULT_ACCOUNT_LOOKUP_RESPONSE_FLOOR_MS = 750;

/**
 * Pads the response of the routes whose work differs when an account exists,
 * so the timing cannot be used to tell. The wait happens after the action has
 * returned, when its queries and transactions are already done: no database
 * connection is held while sleeping. Register it after the throttles, so a
 * refused request is not delayed.
 */
export default class MinimumResponseTimeMiddleware {
	async handle(_ctx: HttpContext, next: NextFn) {
		const startedAt = SYSTEM_CLOCK.now();
		const floorMilliseconds =
			env.get('ACCOUNT_LOOKUP_MIN_RESPONSE_MS') ??
			DEFAULT_ACCOUNT_LOOKUP_RESPONSE_FLOOR_MS;

		try {
			return await next();
		} finally {
			await padToMinimumDuration(startedAt, floorMilliseconds);
		}
	}
}
