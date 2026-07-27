import app from '@adonisjs/core/services/app';
import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware';

import UserTransformer from '#transformers/user';
import { resolveServerLocale } from '#config/inertia';
import packageJson from '../../package.json' with { type: 'json' };
import { MailConfigService } from '#services/mail/mail_config_service';
import { GoogleAuthConfigService } from '#services/auth/google_auth_config_service';
import { RegistrationPolicyService } from '#services/auth/registration_policy_service';

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
		const registrationPolicyService = await app.container.make(
			RegistrationPolicyService
		);
		const mailConfigService = await app.container.make(MailConfigService);

		return {
			errors: ctx.inertia.always(this.getValidationErrors(ctx)),
			// `error` is the key AdonisJS' own self-handling exceptions flash
			// (E_INVALID_CREDENTIALS, E_UNAUTHORIZED_ACCESS), so following it
			// means a refusal reaches the client without any code of ours.
			flash: ctx.inertia.always({
				error: this.getFlashMessage(ctx, 'error'),
				success: this.getFlashMessage(ctx, 'success'),
			}),
			token: session?.flashMessages.get('token'),
			auth: ctx.inertia.always(userAuth),
			authProviders: ctx.inertia.always({
				// Credentials are the mandatory backbone of authentication and
				// cannot be switched off, so the client can always count on at
				// least one sign-in route being reachable.
				isCredentialsEnabled: true,
				isGoogleEnabled: googleAuthConfigService.isEnabled,
			}),
			// Kept apart from `authProviders`: whether an instance takes new
			// accounts is not a way of signing in, and a closed instance still
			// has every provider it had before.
			registrationPolicy: ctx.inertia.always({
				isOpen: await registrationPolicyService.isOpen(),
			}),
			// A reset link is a link in a mailbox: an instance with no outgoing
			// mail has no such feature, and offering the link anyway would send
			// people to a 404 at the exact moment they are already locked out.
			passwordRecovery: ctx.inertia.always({
				isEnabled: mailConfigService.isEnabled,
			}),
			locale: ctx.inertia.always(resolveServerLocale(ctx)),
			appVersion: packageJson.version,
		};
	}

	/**
	 * Flash values are untyped by nature — anything can be flashed under any
	 * key — so the shared prop narrows instead of asserting.
	 */
	private getFlashMessage(ctx: HttpContext, key: string): string | undefined {
		const message: unknown = ctx.session?.flashMessages.get(key);

		return typeof message === 'string' ? message : undefined;
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
