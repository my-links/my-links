import env from '#start/env';
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
		secure: true,

		// TODO: set this to lax and found a solution to keep auth when using extension
		sameSite: 'none',
	},

	/**
	 * The store to use. Make sure to validate the environment
	 * variable in order to infer the store name without any
	 * errors.
	 */
	store: env.get('SESSION_DRIVER'),

	/**
	 * List of configured stores. Refer documentation to see
	 * list of available stores and their config.
	 */
	stores: {
		cookie: stores.cookie(),
	},
});

export default sessionConfig;
