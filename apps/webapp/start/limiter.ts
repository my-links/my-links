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
import type { MiddlewareFn } from '@adonisjs/core/types/http';

import { defineAttemptThrottles } from '#lib/limiter/attempt_throttle';
import {
	LOGIN_ATTEMPT_TIERS,
	REGISTRATION_ATTEMPT_TIERS,
	TOKEN_VERIFICATION_TIERS,
	MAILED_LINK_REQUEST_TIERS,
	SUDO_CONFIRMATION_TIERS,
	EMAIL_CHANGE_REQUEST_TIERS,
} from '#lib/limiter/attempt_tiers';

/**
 * Applied to every `/api/v1/*` route (extension today, any future API
 * client tomorrow). Keyed per authenticated user so all of a user's
 * devices/tabs share one budget, falling back to IP for the one
 * unauthenticated route (`/api/v1/health`). The limit sits far above what
 * the extension's background worker ever needs (a 5-minute sync alarm plus
 * wake triggers (tab switch, window focus), always deduped to a single
 * in-flight request) so it only ever catches a runaway client, never
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
 * its own name: an agent looping through MCP tool calls spends its own
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
 * registering, and it would buy nothing, since a harvester walks a different
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
