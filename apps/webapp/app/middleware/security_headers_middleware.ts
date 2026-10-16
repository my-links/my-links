import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';

/** `same-origin`, not `no-referrer`: redirecting back relies on the Referer of same-site requests. */
export const REFERRER_POLICY = 'same-origin';

export const PERMISSIONS_POLICY = [
	'camera=()',
	'microphone=()',
	'geolocation=()',
	'payment=()',
	'usb=()',
	'browsing-topics=()',
].join(', ');

/**
 * Headers shield has no option for. Set before `next()` so that responses
 * which short-circuit the stack, static files and error pages, carry them too.
 */
export default class SecurityHeadersMiddleware {
	async handle(ctx: HttpContext, next: NextFn) {
		ctx.response.header('Referrer-Policy', REFERRER_POLICY);
		ctx.response.header('Permissions-Policy', PERMISSIONS_POLICY);

		return next();
	}
}
