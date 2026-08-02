import { inject } from '@adonisjs/core';
import { Secret } from '@adonisjs/core/helpers';
import logger from '@adonisjs/core/services/logger';
import type { HttpContext } from '@adonisjs/core/http';

import { AUTH_EVENT_TYPE } from '#constants/auth';
import { resolveRequestOrigin } from '#lib/request_origin';
import { PasswordService } from '#services/auth/password_service';
import { AuthEventService } from '#services/auth/auth_event_service';
import { MINIMUM_PASSWORD_LENGTH } from '#validators/auth/password_rules';
import { newPasswordValidator } from '#validators/auth/new_password_validator';
import { oneTimeTokenValidator } from '#validators/auth/one_time_token_validator';

const PASSWORD_RESET_MESSAGE =
	'Your password is reset — sign in with it, everything else was signed out';

@inject()
export default class ResetPasswordController {
	constructor(
		protected readonly passwordService: PasswordService,
		protected readonly authEventService: AuthEventService
	) {}

	/**
	 * The form is rendered without touching the token: checking it here would
	 * spend nothing and prove nothing, since the submission has to check it
	 * again anyway. An unusable link is refused on submit, with the same one
	 * wording every other dead link gets.
	 */
	async render(ctx: HttpContext) {
		const { token } = await ctx.request.validateUsing(oneTimeTokenValidator, {
			data: ctx.params,
		});

		return ctx.inertia.render('auth/reset_password', {
			token,
			minimumPasswordLength: MINIMUM_PASSWORD_LENGTH,
		});
	}

	async execute(ctx: HttpContext) {
		const { token } = await ctx.request.validateUsing(oneTimeTokenValidator, {
			data: ctx.params,
		});
		const { password } = await ctx.request.validateUsing(newPasswordValidator);

		// Wrapped at the boundary it arrives on, so the clear value cannot be
		// printed by anything downstream that takes it for an ordinary string.
		const user = await this.passwordService.resetPassword({
			secret: new Secret(token),
			newPassword: password,
		});

		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.PASSWORD_RESET_COMPLETED,
			userId: user.id,
			...resolveRequestOrigin(ctx),
		});

		ctx.session.flash('success', PASSWORD_RESET_MESSAGE);
		logger.info(`[${user.email}] password reset`);

		// Never signs the visitor in. A reset link arrives in a mailbox, and
		// turning "I read this inbox" straight into a session would make a
		// leaked archive of old mail an account takeover.
		return ctx.response.redirectToNamedRoute('auth.login');
	}
}
