import { inject } from '@adonisjs/core';
import logger from '@adonisjs/core/services/logger';
import type { HttpContext } from '@adonisjs/core/http';

import { AUTH_EVENT_TYPE } from '#constants/auth';
import { PasswordService } from '#services/auth/password_service';
import { AuthEventService } from '#services/auth/auth_event_service';
import { resolveAuthEventOrigin } from '#lib/auth/auth_event_origin';
import { newPasswordValidator } from '#validators/auth/new_password_validator';

const PASSWORD_SET_MESSAGE =
	'Your password is set — you can now sign in with your email address';

@inject()
export default class SetPasswordController {
	constructor(
		protected readonly passwordService: PasswordService,
		protected readonly authEventService: AuthEventService
	) {}

	/**
	 * The way off a sole Google identity. Guarded by sudo mode rather than by
	 * an emailed link: the visitor is already signed in and already controls
	 * the account, so a mail round trip would add friction without adding a
	 * barrier — and would break this path entirely on an instance with no SMTP,
	 * which is exactly the instance that needs it most.
	 */
	async execute(ctx: HttpContext) {
		const { password } = await ctx.request.validateUsing(newPasswordValidator);
		const user = ctx.auth.getUserOrFail();

		await this.passwordService.setPassword({ user, newPassword: password });

		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.PASSWORD_SET,
			userId: user.id,
			...resolveAuthEventOrigin(ctx),
		});

		ctx.session.flash('success', PASSWORD_SET_MESSAGE);
		logger.info(`[${user.email}] password set`);

		return ctx.response.redirectToNamedRoute('user.settings');
	}
}
