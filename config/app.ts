import { defineConfig } from '@adonisjs/core/http';
import app from '@adonisjs/core/services/app';
import proxyaddr from 'proxy-addr';

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

	trustProxy: proxyaddr.compile([
		'loopback',
		'uniquelocal',
		'linklocal',
		'10.0.0.0/8',
	]),

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
