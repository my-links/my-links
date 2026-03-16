import type { Authenticators } from '@adonisjs/auth/types';
import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn, RoutesList } from '@adonisjs/core/types/http';

/**
 * Guest middleware is used to deny access to routes that should
 * be accessed by unauthenticated users.
 *
 * For example, the login page should not be accessible if the user
 * is already logged-in
 */
export default class GuestMiddleware {
	/**
	 * The URL to redirect to when user is logged-in
	 */
	redirectTo: keyof RoutesList['GET'] = 'home';

	async handle(
		ctx: HttpContext,
		next: NextFn,
		options: {
			guards?: (keyof Authenticators)[];
			redirectTo?: keyof RoutesList['GET'];
		} = {}
	) {
		for (const guard of options.guards ?? [ctx.auth.defaultGuard]) {
			if (await ctx.auth.use(guard).check()) {
				const redirectUrl = options.redirectTo ?? this.redirectTo;
				return ctx.response.redirect().toRoute(redirectUrl);
			}
		}

		return next();
	}
}
