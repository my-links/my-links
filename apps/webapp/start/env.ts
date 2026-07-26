import { Env } from '@adonisjs/core/env';

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
	 * one of the two is rejected at boot — see `resolveGoogleAuthConfig`.
	 */
	GOOGLE_CLIENT_ID: Env.schema.string.optional(),
	GOOGLE_CLIENT_SECRET: Env.schema.string.optional(),

	/*
  |----------------------------------------------------------
  | Variables for configuring the limiter package
  |----------------------------------------------------------
  */
	LIMITER_STORE: Env.schema.enum(['database', 'memory'] as const),

	/*
|----------------------------------------------------------
| Variables for configuring the mail package
|----------------------------------------------------------
*/
	/**
	 * Optional: leave them all empty to run without outgoing mail. Setting one
	 * commits to a complete configuration — see `resolveMailConfig`.
	 */
	SMTP_HOST: Env.schema.string.optional(),
	SMTP_PORT: Env.schema.number.optional(),
	SMTP_USERNAME: Env.schema.string.optional(),
	SMTP_PASSWORD: Env.schema.string.optional(),
	SMTP_SECURE: Env.schema.boolean.optional(),
	MAIL_FROM_ADDRESS: Env.schema.string.optional(),
	MAIL_FROM_NAME: Env.schema.string.optional(),
});
