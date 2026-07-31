import { inject } from '@adonisjs/core';
import { Secret } from '@adonisjs/core/helpers';
import logger from '@adonisjs/core/services/logger';
import type { HttpContext } from '@adonisjs/core/http';

import { AUTH_EVENT_TYPE } from '#constants/auth';
import { AuthEventService } from '#services/auth/auth_event_service';
import { resolveAuthEventOrigin } from '#lib/auth/auth_event_origin';
import { EmailChangeService } from '#services/auth/email_change_service';
import { oneTimeTokenValidator } from '#validators/auth/one_time_token_validator';

const EMAIL_CHANGE_CANCELLED_MESSAGE =
	'The address change is cancelled and everything was signed out — sign in again';

@inject()
export default class CancelEmailChangeController {
	constructor(
		protected readonly emailChangeService: EmailChangeService,
		protected readonly authEventService: AuthEventService
	) {}

	/**
	 * The veto held by the address the account is leaving. It always lands on
	 * the sign-in page: cancelling signs every session out, including the one
	 * that may have opened this link.
	 */
	async execute(ctx: HttpContext) {
		const { token } = await ctx.request.validateUsing(oneTimeTokenValidator, {
			data: ctx.params,
		});

		// Wrapped at the boundary it arrives on, so the clear value cannot be
		// printed by anything downstream that takes it for an ordinary string.
		const user = await this.emailChangeService.cancel(new Secret(token));

		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.EMAIL_CHANGE_CANCELLED,
			userId: user.id,
			...resolveAuthEventOrigin(ctx),
		});

		ctx.session.flash('success', EMAIL_CHANGE_CANCELLED_MESSAGE);
		logger.info(`[${user.email}] email change cancelled`);

		return ctx.response.redirectToNamedRoute('auth.login');
	}
}
