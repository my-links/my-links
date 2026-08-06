import { inject } from '@adonisjs/core';
import type { Session } from '@adonisjs/session';
import logger from '@adonisjs/core/services/logger';
import type { HttpContext } from '@adonisjs/core/http';

import { AUTH_EVENT_TYPE } from '#constants/auth';
import { resolveRequestOrigin } from '#lib/request_origin';
import { SessionService } from '#services/user/session_service';
import { loginValidator } from '#validators/auth/login_validator';
import { AuthEventService } from '#services/auth/auth_event_service';
import { CredentialsAuthService } from '#services/auth/credentials_auth_service';
import { EmailVerificationService } from '#services/auth/email_verification_service';

@inject()
export default class LoginController {
	constructor(
		protected readonly credentialsAuthService: CredentialsAuthService,
		protected readonly emailVerificationService: EmailVerificationService,
		protected readonly authEventService: AuthEventService,
		protected readonly sessionService: SessionService
	) {}

	/**
	 * `unconfirmedEmail` is a page prop rather than a shared one: it is set by
	 * the refusal that sends the visitor right back here, and no other page has
	 * a reason to know about it.
	 */
	async render({ inertia, session }: HttpContext) {
		return inertia.render('auth/login', {
			unconfirmedEmail: this.takeUnconfirmedEmail(session),
		});
	}

	async execute(ctx: HttpContext) {
		const { email, password } = await ctx.request.validateUsing(loginValidator);
		const origin = resolveRequestOrigin(ctx);

		const user = await this.credentialsAuthService.verifyCredentials({
			email,
			password,
			origin,
		});

		// Deliberately after the password check, never inside it: a refusal
		// naming an address as unconfirmed, served before the password is
		// verified, is an account enumeration oracle.
		await this.emailVerificationService.assertCanSignIn(user, origin);

		await ctx.auth.use('web').login(user);
		await this.sessionService.createAuthSession(user);

		// Journaled here rather than alongside the failures, because a login only
		// succeeds once the session exists — verifying a password is also what
		// sudo mode will do, and that must not read as a sign-in.
		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.LOGIN_SUCCEEDED,
			userId: user.id,
			...resolveRequestOrigin(ctx),
		});

		logger.info(`[${user.email}] auth success`);
		// Honors an intended URL stashed by AuthMiddleware, so a guest sent to
		// the form from a deep link lands back on it instead of the dashboard.
		return ctx.response.redirect().toIntendedRoute('collection.favorites');
	}

	/**
	 * Flash values are untyped by nature, so the prop narrows rather than
	 * asserting.
	 */
	private takeUnconfirmedEmail(session: Session): string | null {
		const flashedEmail: unknown = session.flashMessages.get('unconfirmedEmail');

		return typeof flashedEmail === 'string' ? flashedEmail : null;
	}
}
