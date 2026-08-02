import { inject } from '@adonisjs/core';
import { Secret } from '@adonisjs/core/helpers';
import logger from '@adonisjs/core/services/logger';
import type { HttpContext } from '@adonisjs/core/http';

import { AUTH_EVENT_TYPE } from '#constants/auth';
import { resolveRequestOrigin } from '#lib/request_origin';
import { AuthEventService } from '#services/auth/auth_event_service';
import { EmailChangeService } from '#services/auth/email_change_service';
import { oneTimeTokenValidator } from '#validators/auth/one_time_token_validator';

const EMAIL_CHANGED_MESSAGE = 'Your account now uses this email address';

@inject()
export default class ConfirmEmailChangeController {
	constructor(
		protected readonly emailChangeService: EmailChangeService,
		protected readonly authEventService: AuthEventService
	) {}

	/**
	 * Answers a GET despite writing, because it is reached by clicking a link —
	 * the single-use token is what keeps that safe. Open to guests: the link
	 * lands in the *new* mailbox, which is rarely the browser holding a session.
	 */
	async execute(ctx: HttpContext) {
		const { token } = await ctx.request.validateUsing(oneTimeTokenValidator, {
			data: ctx.params,
		});

		// Wrapped at the boundary it arrives on, so the clear value cannot be
		// printed by anything downstream that takes it for an ordinary string.
		const user = await this.emailChangeService.confirm(new Secret(token));

		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.EMAIL_CHANGED,
			userId: user.id,
			...resolveRequestOrigin(ctx),
		});

		ctx.session.flash('success', EMAIL_CHANGED_MESSAGE);
		logger.info(`[${user.email}] email changed`);

		const isSignedIn = await ctx.auth.check();

		return ctx.response.redirectToNamedRoute(
			isSignedIn ? 'user.settings' : 'auth.login'
		);
	}
}
