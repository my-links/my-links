import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import {
	frameGuardFactory,
	hstsFactory,
	noSniffFactory,
} from '@adonisjs/shield/guards';

import shieldConfig from '#config/shield';

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
 * Headers shield has no option for, plus shield's own header guards built from
 * the shield config. Set before `next()` so that responses which short-circuit
 * the stack, static files and error pages, carry them too.
 */
export default class SecurityHeadersMiddleware {
	private readonly shieldHeaderGuards = [
		frameGuardFactory(shieldConfig.xFrame),
		hstsFactory(shieldConfig.hsts),
		noSniffFactory(shieldConfig.contentTypeSniffing),
	];

	async handle(ctx: HttpContext, next: NextFn) {
		ctx.response.header('Referrer-Policy', REFERRER_POLICY);
		ctx.response.header('Permissions-Policy', PERMISSIONS_POLICY);
		this.shieldHeaderGuards.forEach((applyGuard) => applyGuard(ctx));

		return next();
	}
}
