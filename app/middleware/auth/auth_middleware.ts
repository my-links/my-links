import type { Authenticators } from '@adonisjs/auth/types';
import type { HttpContext } from '@adonisjs/core/http';
import { urlFor } from '@adonisjs/core/services/url_builder';
import type { NextFn } from '@adonisjs/core/types/http';

export default class AuthMiddleware {
	redirectTo = urlFor('auth');

	async handle(
		ctx: HttpContext,
		next: NextFn,
		options: {
			guards?: (keyof Authenticators)[];
		} = {}
	) {
		await ctx.auth.authenticateUsing(options.guards, {
			loginRoute: this.redirectTo,
		});
		return next();
	}
}
