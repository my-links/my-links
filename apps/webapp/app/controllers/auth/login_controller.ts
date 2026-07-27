import { inject } from '@adonisjs/core';
import logger from '@adonisjs/core/services/logger';
import type { HttpContext } from '@adonisjs/core/http';

import { AUTH_EVENT_TYPE } from '#constants/auth';
import { SessionService } from '#services/user/session_service';
import { loginValidator } from '#validators/auth/login_validator';
import { AuthEventService } from '#services/auth/auth_event_service';
import { resolveAuthEventOrigin } from '#lib/auth/auth_event_origin';
import { CredentialsAuthService } from '#services/auth/credentials_auth_service';

@inject()
export default class LoginController {
	constructor(
		protected readonly credentialsAuthService: CredentialsAuthService,
		protected readonly authEventService: AuthEventService,
		protected readonly sessionService: SessionService
	) {}

	async render({ inertia }: HttpContext) {
		return inertia.render('auth/login', {});
	}

	async execute(ctx: HttpContext) {
		const { email, password } = await ctx.request.validateUsing(loginValidator);

		const user = await this.credentialsAuthService.verifyCredentials({
			email,
			password,
			origin: resolveAuthEventOrigin(ctx),
		});

		await ctx.auth.use('web').login(user);
		this.sessionService.createAuthSession(user);

		// Journaled here rather than alongside the failures, because a login only
		// succeeds once the session exists — verifying a password is also what
		// sudo mode will do, and that must not read as a sign-in.
		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.LOGIN_SUCCEEDED,
			userId: user.id,
			...resolveAuthEventOrigin(ctx),
		});

		logger.info(`[${user.email}] auth success`);
		// Honors an intended URL stashed by AuthMiddleware, so a guest sent to
		// the form from a deep link lands back on it instead of the dashboard.
		return ctx.response.redirect().toIntendedRoute('collection.favorites');
	}
}
