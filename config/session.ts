import app from '@adonisjs/core/services/app';
import { defineConfig, stores } from '@adonisjs/session';

const sessionConfig = defineConfig({
	enabled: true,
	cookieName: 'adonis-session',

	/**
	 * When set to true, the session id cookie will be deleted
	 * once the user closes the browser.
	 */
	clearWithBrowser: false,

	/**
	 * Define how long to keep the session data alive without
	 * any activity.
	 */
	age: '7d',

	/**
	 * Configuration for session cookie and the
	 * cookie store
	 */
	cookie: {
		path: '/',
		httpOnly: true,
		secure: app.inProduction,
		sameSite: 'lax',
	},

	/**
	 * The store to use. Make sure to validate the environment
	 * variable in order to infer the store name without any
	 * errors.
	 */
	store: 'database',

	/**
	 * List of configured stores. Refer documentation to see
	 * list of available stores and their config.
	 */
	stores: {
		cookie: stores.cookie(),
		database: stores.database({
			connectionName: 'postgres',
			tableName: 'user_sessions',
		}),
	},
});

export default sessionConfig;
