import { defineConfig } from '@adonisjs/cors';

import { isExtensionOrigin } from '#validators/extension/is_extension_origin';

/**
 * Only `/api/v1/*` is reachable cross-origin. Everything else is the Inertia
 * app, which is same-origin by construction and session-cookie authenticated —
 * opening it up is the one thing that could actually be abused.
 */
const API_PATH_PREFIX = '/api/v1/';

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 *
 * The browser extension is the only cross-origin caller. On Chromium it never
 * needs this — an extension page holding a host permission bypasses CORS and
 * sends no `Origin` at all — but Firefox issues an ordinary cross-origin
 * request, preflight included, so the API has to answer for itself.
 *
 * `credentials` is off, which is what makes the extension-origin allowance
 * safe: the browser never attaches the session cookie, so a hostile extension
 * gains nothing it could not already do with an unauthenticated fetch. The
 * API's own auth is a bearer token it has no way of obtaining.
 */
const corsConfig = defineConfig({
	enabled: true,
	origin: (origin, { request }) =>
		request.url().startsWith(API_PATH_PREFIX) && isExtensionOrigin(origin),
	methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
	headers: true,
	exposeHeaders: [],
	credentials: false,
	maxAge: 90,
});

export default corsConfig;
