import { Env } from '@adonisjs/core/env';

export default await Env.create(new URL('../', import.meta.url), {
	NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
	PORT: Env.schema.number(),
	APP_KEY: Env.schema.string(),
	HOST: Env.schema.string({ format: 'host' }),
	LOG_LEVEL: Env.schema.string(),

	/*
  |----------------------------------------------------------
  | Variables for configuring session package
  |----------------------------------------------------------
  */
	SESSION_DRIVER: Env.schema.enum(['cookie', 'memory'] as const),

	/*
  |----------------------------------------------------------
  | Variables for configuring app url
  |----------------------------------------------------------
  */
	VITE_APP_URL: Env.schema.string({ format: 'url', tld: false }), // Remove TLD to allow localhost

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
	GOOGLE_CLIENT_ID: Env.schema.string(),
	GOOGLE_CLIENT_SECRET: Env.schema.string(),
});
