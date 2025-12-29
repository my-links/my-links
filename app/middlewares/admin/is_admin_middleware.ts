import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';

export default class AdminMiddleware {
	async handle(ctx: HttpContext, next: NextFn) {
		if (!ctx.auth.user?.isAdmin) {
			return ctx.response.redirectToNamedRoute('favorites.show');
		}
		return next();
	}
}
