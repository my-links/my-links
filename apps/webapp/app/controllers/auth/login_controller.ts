import { inject } from '@adonisjs/core';
import logger from '@adonisjs/core/services/logger';
import type { HttpContext } from '@adonisjs/core/http';

import type User from '#models/user';
import { AUTH_EVENT_TYPE } from '#constants/auth';
import { SessionService } from '#services/user/session_service';
import { loginValidator } from '#validators/auth/login_validator';
import { AuthEventService } from '#services/auth/auth_event_service';
import type { AuthEventOrigin } from '#services/auth/auth_event_service';
import { CredentialsAuthService } from '#services/auth/credentials_auth_service';
import InvalidCredentialsException from '#exceptions/auth/invalid_credentials_exception';

/**
 * One wording for a wrong password and for an email nobody ever registered.
 * A message that varies with the cause tells an attacker which addresses are
 * worth a dictionary run.
 */
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email address or password';

/**
 * The flash bag Inertia turns into the `errors` shared prop — see
 * `InertiaMiddleware.getValidationErrors`. A refusal that is not a validation
 * failure still has to land here to reach `useForm().errors` on the client.
 */
const INERTIA_INPUT_ERRORS_BAG = 'inputErrorsBag';

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
		const user = await this.findAccountFor(email, password);

		if (!user) {
			return this.refuse(ctx, email);
		}

		return this.openSession(ctx, user);
	}

	private async findAccountFor(
		email: string,
		password: string
	): Promise<User | null> {
		try {
			return await this.credentialsAuthService.verifyCredentials(
				email,
				password
			);
		} catch (error) {
			if (error instanceof InvalidCredentialsException) {
				return null;
			}

			throw error;
		}
	}

	private async openSession(ctx: HttpContext, user: User) {
		await ctx.auth.use('web').login(user);
		this.sessionService.createAuthSession(user);

		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.LOGIN_SUCCEEDED,
			userId: user.id,
			...this.originOf(ctx),
		});

		logger.info(`[${user.email}] auth success`);
		// Honors an intended URL stashed by AuthMiddleware, so a guest sent to
		// the form from a deep link lands back on it instead of the dashboard.
		return ctx.response.redirect().toIntendedRoute('collection.favorites');
	}

	private async refuse(ctx: HttpContext, email: string) {
		await this.authEventService.recordFailedLogin({
			email,
			...this.originOf(ctx),
		});

		ctx.session.flash(INERTIA_INPUT_ERRORS_BAG, {
			email: [INVALID_CREDENTIALS_MESSAGE],
		});

		return ctx.response.redirectToNamedRoute('auth.login');
	}

	private originOf(ctx: HttpContext): AuthEventOrigin {
		return {
			ip: ctx.request.ip(),
			userAgent: ctx.request.header('user-agent') ?? null,
		};
	}
}
