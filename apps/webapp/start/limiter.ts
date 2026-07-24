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

import limiter from '@adonisjs/limiter/services/main';

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
