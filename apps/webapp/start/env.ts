import { Env } from '@adonisjs/core/env';

import { REGISTRATION_POLICIES } from '#constants/auth';
import { parseAdminSetupToken } from '#lib/auth/admin_setup_token';
import { parseExtensionIds } from '#lib/extension/extension_ids';
import { parseTrustedProxies } from '#lib/network/trusted_proxies';

export default await Env.create(new URL('../', import.meta.url), {
	NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
	PORT: Env.schema.number(),
	APP_KEY: Env.schema.string(),
	HOST: Env.schema.string({ format: 'host' }),
	LOG_LEVEL: Env.schema.string(),

	/*
|----------------------------------------------------------
| Variables for configuring app url
|----------------------------------------------------------
*/
	APP_URL: Env.schema.string({ format: 'url', tld: false }), // Remove TLD to allow localhost

	/*
|----------------------------------------------------------
| Variables for configuring database connection
|----------------------------------------------------------
*/
	DB_HOST: Env.schema.string({ format: 'host' }),
	DB_PORT: Env.schema.number(),
	DB_USER: Env.schema.string(),
	DB_PASSWORD: Env.schema.string.optional(),
	DB_DATABASE: Env.schema.string(),

	/*
|----------------------------------------------------------
| Variables for configuring ally package
|----------------------------------------------------------
*/
	/**
	 * Optional: leave both empty to run without Google sign-in. Setting only
	 * one of the two is rejected at boot, see `resolveGoogleAuthConfig`.
	 */
	GOOGLE_CLIENT_ID: Env.schema.string.optional(),
	GOOGLE_CLIENT_SECRET: Env.schema.string.optional(),

	/*
|----------------------------------------------------------
| Variables for configuring the registration policy
|----------------------------------------------------------
*/
	/**
	 * Optional: leave it unset to let the instance decide; open until it has
	 * its first account, closed afterwards. See `resolveRegistrationPolicy`.
	 */
	ALLOW_REGISTRATION: Env.schema.enum.optional(REGISTRATION_POLICIES),

	/**
	 * Optional: the secret that lets a registration claim the administrator role
	 * while the instance has none. Left unset, one is generated at boot and its
	 * setup link logged. See `AdminSetupService`.
	 */
	ADMIN_SETUP_TOKEN: parseAdminSetupToken,

	/**
	 * Optional: the minimum response time, in milliseconds, of the sign-up,
	 * password reset, verification resend and email change routes. See
	 * `MinimumResponseTimeMiddleware`.
	 */
	ACCOUNT_LOOKUP_MIN_RESPONSE_MS: Env.schema.number.optional(),

	/*
|----------------------------------------------------------
| Variables for configuring the browser extension
|----------------------------------------------------------
*/
	/**
	 * Optional: comma-separated Chromium extension ids or Firefox add-on ids
	 * trusted in addition to the official store builds, for dev or self-built
	 * extensions.
	 */
	EXTENSION_IDS: parseExtensionIds,

	/*
|----------------------------------------------------------
| Variables for configuring the reverse proxy
|----------------------------------------------------------
*/
	/**
	 * Optional: comma-separated proxy-addr names, IPs or CIDR ranges trusted to
	 * set forwarded headers, replacing the default private ranges. See
	 * `parseTrustedProxies`.
	 */
	TRUSTED_PROXIES: parseTrustedProxies,

	/*
|----------------------------------------------------------
| Variables for configuring the mail package
|----------------------------------------------------------
*/
	/**
	 * Optional: leave them all empty to run without outgoing mail. Setting one
	 * commits to a complete configuration, see `resolveMailConfig`.
	 */
	SMTP_HOST: Env.schema.string.optional(),
	SMTP_PORT: Env.schema.number.optional(),
	SMTP_USERNAME: Env.schema.string.optional(),
	SMTP_PASSWORD: Env.schema.string.optional(),
	SMTP_SECURE: Env.schema.boolean.optional(),
	MAIL_FROM_ADDRESS: Env.schema.string.optional(),
	MAIL_FROM_NAME: Env.schema.string.optional(),
});
