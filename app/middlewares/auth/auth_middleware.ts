import { getRoute } from '#lib/route_helper';
import type { Authenticators } from '@adonisjs/auth/types';
import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';

export default class AuthMiddleware {
	redirectTo = getRoute('auth').path;

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
