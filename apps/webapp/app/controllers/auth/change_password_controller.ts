import { inject } from '@adonisjs/core';
import logger from '@adonisjs/core/services/logger';
import type { HttpContext } from '@adonisjs/core/http';

import { AUTH_EVENT_TYPE } from '#constants/auth';
import { resolveRequestOrigin } from '#lib/request_origin';
import { PasswordService } from '#services/auth/password_service';
import { AuthEventService } from '#services/auth/auth_event_service';
import { newPasswordValidator } from '#validators/auth/new_password_validator';

const PASSWORD_CHANGED_MESSAGE =
	'Your password is changed — every other session and extension token was signed out';

@inject()
export default class ChangePasswordController {
	constructor(
		protected readonly passwordService: PasswordService,
		protected readonly authEventService: AuthEventService
	) {}

	/**
	 * No "current password" field: sudo mode asked for it moments ago, and it
	 * is the very same proof. Asking twice inside one window is the kind of
	 * friction that teaches people to stop reading prompts.
	 */
	async execute(ctx: HttpContext) {
		const { password } = await ctx.request.validateUsing(newPasswordValidator);
		const user = ctx.auth.getUserOrFail();

		await this.passwordService.changePassword({
			user,
			newPassword: password,
			currentSessionId: ctx.session.sessionId,
		});

		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.PASSWORD_CHANGED,
			userId: user.id,
			...resolveRequestOrigin(ctx),
		});

		ctx.session.flash('success', PASSWORD_CHANGED_MESSAGE);
		logger.info(`[${user.email}] password changed`);

		return ctx.response.redirectToNamedRoute('user.settings');
	}
}
