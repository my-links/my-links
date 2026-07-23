import app from '@adonisjs/core/services/app';
import { defineConfig, stores } from '@adonisjs/session';

import env from '#start/env';

const SESSION_STORES = ['cookie', 'database', 'memory'] as const;
type SessionStore = (typeof SESSION_STORES)[number];

function isSessionStore(value: string): value is SessionStore {
	return (SESSION_STORES as readonly string[]).includes(value);
}

function resolveSessionStore(): SessionStore {
	const value = env.get('SESSION_DRIVER', 'database');
	if (!isSessionStore(value)) {
		throw new Error(`Invalid SESSION_DRIVER value: "${value}"`);
	}
	return value;
}

const sessionConfig = defineConfig({
	enabled: true,
	cookieName: 'my-links-session',

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
	 * `SESSION_DRIVER=memory` in `.env.test` — Japa's session test client
	 * always simulates sessions against the `memory` store, so the app's
	 * own session middleware must resolve to that same store during tests
	 * (a `database`-backed session written only to the test's in-memory
	 * client is invisible to it, and `loginAs()` silently fails).
	 */
	store: resolveSessionStore(),

	/**
	 * List of configured stores. Refer documentation to see
	 * list of available stores and their config.
	 * `memory` needs no configuration, so it isn't listed here — it's
	 * available out of the box whenever `store: 'memory'` is selected.
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
