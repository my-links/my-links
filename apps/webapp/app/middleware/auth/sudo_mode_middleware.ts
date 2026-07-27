import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import { urlFor } from '@adonisjs/core/services/url_builder';

import { SudoModeService } from '#services/auth/sudo_mode_service';

const GET_METHOD = 'GET';

/**
 * Stands in front of the operations that could hand an account to somebody
 * else, and demands that identity was proved recently — not merely that a
 * session exists. Always paired with `auth`, which is what guarantees there is
 * an account to confirm against.
 */
@inject()
export default class SudoModeMiddleware {
	constructor(protected readonly sudoModeService: SudoModeService) {}

	async handle(ctx: HttpContext, next: NextFn) {
		if (this.sudoModeService.isConfirmed(ctx.session)) {
			return next();
		}

		this.sudoModeService.rememberReturnUrl(ctx.session, this.returnUrlOf(ctx));

		return ctx.response.redirectToNamedRoute('auth.sudo');
	}

	/**
	 * A refused page is worth coming back to; a refused submission is not — the
	 * body is gone by then, so the visitor is sent to the settings page they
	 * submitted from and fills the form once more.
	 */
	private returnUrlOf(ctx: HttpContext): string {
		return ctx.request.method() === GET_METHOD
			? ctx.request.url(true)
			: urlFor('user.settings');
	}
}
