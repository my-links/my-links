import { inject } from '@adonisjs/core';
import { Secret } from '@adonisjs/core/helpers';
import logger from '@adonisjs/core/services/logger';
import type { HttpContext } from '@adonisjs/core/http';

import { AUTH_EVENT_TYPE } from '#constants/auth';
import { AuthEventService } from '#services/auth/auth_event_service';
import { resolveAuthEventOrigin } from '#lib/auth/auth_event_origin';
import { oneTimeTokenValidator } from '#validators/auth/one_time_token_validator';
import { EmailVerificationService } from '#services/auth/email_verification_service';

const CONFIRMED_MESSAGE = 'Your email address is confirmed';

@inject()
export default class VerifyEmailController {
	constructor(
		protected readonly emailVerificationService: EmailVerificationService,
		protected readonly authEventService: AuthEventService
	) {}

	/**
	 * Reached by clicking a link, so it answers a GET despite writing — the
	 * single-use token is what keeps that safe. Open to guests and to signed-in
	 * users alike: whoever holds the link proved they read the mailbox.
	 */
	async execute(ctx: HttpContext) {
		const { token } = await ctx.request.validateUsing(oneTimeTokenValidator, {
			data: ctx.params,
		});

		// Wrapped at the boundary it arrives on, so the clear value cannot be
		// printed by anything downstream that takes it for an ordinary string.
		const user = await this.emailVerificationService.confirm(new Secret(token));

		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.EMAIL_VERIFIED,
			userId: user.id,
			...resolveAuthEventOrigin(ctx),
		});

		ctx.session.flash('success', CONFIRMED_MESSAGE);
		logger.info(`[${user.email}] email verified`);

		return ctx.response.redirectToNamedRoute('auth.login');
	}
}
