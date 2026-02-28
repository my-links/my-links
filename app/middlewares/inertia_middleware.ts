import { resolveServerLocale } from '#config/inertia';
import UserTransformer from '#transformers/user';
import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware';

export default class InertiaMiddleware extends BaseInertiaMiddleware {
	async share(ctx: HttpContext) {
		const { session } = ctx as Partial<HttpContext>;
		const isAuthenticated = await ctx.auth.check();
		const user = ctx.auth.user;

		const userAuth =
			isAuthenticated && user
				? {
						isAuthenticated: true,
						isAdmin: Boolean(user.isAdmin),
						user: UserTransformer.transform(user),
					}
				: {
						isAuthenticated: false,
						isAdmin: false,
						user: undefined,
					};

		return {
			errors: ctx.inertia.always(this.getValidationErrors(ctx)),
			token: session?.flashMessages.get('token'),
			auth: ctx.inertia.always(userAuth),
			locale: ctx.inertia.always(resolveServerLocale(ctx)),
		};
	}

	async handle(ctx: HttpContext, next: NextFn) {
		await this.init(ctx);
		const output = await next();
		this.dispose(ctx);
		return output;
	}
}

declare module '@adonisjs/inertia/types' {
	type MiddlewareSharedProps =
		import('@adonisjs/inertia/types').InferSharedProps<InertiaMiddleware>;

	export interface SharedProps extends MiddlewareSharedProps {}

	export interface InertiaPages {
		[page: string]: import('@adonisjs/inertia/types').ComponentProps;
	}
}
