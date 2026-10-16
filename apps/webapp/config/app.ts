import app from '@adonisjs/core/services/app';
import { defineConfig } from '@adonisjs/core/http';

import env from '#start/env';
import { resolveTrustProxy } from '#lib/network/trusted_proxies';

/**
 * The configuration settings used by the HTTP server
 */
export const http = defineConfig({
	generateRequestId: true,
	allowMethodSpoofing: false,

	/**
	 * Enabling async local storage will let you access HTTP context
	 * from anywhere inside your application.
	 */
	useAsyncLocalStorage: true,

	trustProxy: resolveTrustProxy(env.get('TRUSTED_PROXIES')),

	/**
	 * Manage cookies configuration. The settings for the session id cookie are
	 * defined inside the "config/session.ts" file.
	 */
	cookie: {
		domain: '',
		path: '/',
		maxAge: '2h',
		httpOnly: true,
		secure: app.inProduction,
		sameSite: 'lax',
	},
});
