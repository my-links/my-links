import app from '@adonisjs/core/services/app';
import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware';

import UserTransformer from '#transformers/user';
import { resolveServerLocale } from '#config/inertia';
import packageJson from '../../package.json' with { type: 'json' };
import { GoogleAuthConfigService } from '#services/auth/google_auth_config_service';

export default class InertiaMiddleware extends BaseInertiaMiddleware {
	async share(ctx: HttpContext) {
		const { session } = ctx;
		const isAuthenticated = await ctx.auth?.check();
		const user = ctx.auth?.user;

		const serializedUser =
			isAuthenticated && user
				? await ctx.serialize(UserTransformer.transform(user))
				: null;

		const userAuth =
			isAuthenticated && user && serializedUser
				? {
						isAuthenticated: true,
						isAdmin: Boolean(user.isAdmin),
						user: serializedUser.data,
					}
				: {
						isAuthenticated: false,
						isAdmin: false,
						user: undefined,
					};

		const googleAuthConfigService = await app.container.make(
			GoogleAuthConfigService
		);

		return {
			errors: ctx.inertia.always(this.getValidationErrors(ctx)),
			token: session?.flashMessages.get('token'),
			auth: ctx.inertia.always(userAuth),
			authProviders: ctx.inertia.always({
				// Credentials are the mandatory backbone of authentication and
				// cannot be switched off, so the client can always count on at
				// least one sign-in route being reachable.
				isCredentialsEnabled: true,
				isGoogleEnabled: googleAuthConfigService.isEnabled,
			}),
			locale: ctx.inertia.always(resolveServerLocale(ctx)),
			appVersion: packageJson.version,
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
