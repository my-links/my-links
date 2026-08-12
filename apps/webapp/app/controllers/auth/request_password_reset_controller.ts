import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { AUTH_EVENT_TYPE } from '#constants/auth';
import { MailService } from '#services/mail/mail_service';
import { resolveRequestOrigin } from '#lib/request_origin';
import { AuthEventService } from '#services/auth/auth_event_service';
import { emailAddressValidator } from '#validators/auth/email_address_validator';
import { PasswordResetLinkService } from '#services/auth/password_reset_link_service';
import PasswordResetUnavailableException from '#exceptions/auth/password_reset_unavailable_exception';

/**
 * The one thing a visitor is told, whether or not the address they typed has
 * an account. Exported so the specs assert against the sentence the controller
 * actually sends rather than a copy of it.
 */
export const PASSWORD_RESET_REQUEST_MESSAGE =
	'If that email address has an account, a reset link is on its way to it';

@inject()
export default class RequestPasswordResetController {
	constructor(
		protected readonly passwordResetLinkService: PasswordResetLinkService,
		protected readonly authEventService: AuthEventService,
		protected readonly mailService: MailService
	) {}

	async render({ inertia }: HttpContext) {
		this.assertPasswordResetIsAvailable();

		return inertia.render('auth/forgot_password', {});
	}

	async execute(ctx: HttpContext) {
		this.assertPasswordResetIsAvailable();

		const { email } = await ctx.request.validateUsing(emailAddressValidator);

		await this.passwordResetLinkService.requestReset(email);

		// Journaled without resolving the account, unlike a failed sign-in: the
		// address is attacker-supplied here, and looking it up to attribute the
		// row would put the very lookup this flow refuses to answer back into
		// the request. Phase 10's journal reads the reset that follows.
		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.PASSWORD_RESET_REQUESTED,
			userId: null,
			...resolveRequestOrigin(ctx),
		});

		ctx.session.flash('success', PASSWORD_RESET_REQUEST_MESSAGE);

		return ctx.response.redirectToNamedRoute('auth.login');
	}

	/**
	 * A reset link is a link in a mailbox, so an instance with no outgoing mail
	 * does not have this feature at all — 404, the way the Google routes answer
	 * when Google is not configured. Recovery there is
	 * `node ace user:reset-password`.
	 */
	private assertPasswordResetIsAvailable(): void {
		if (this.mailService.isEnabled) return;

		throw new PasswordResetUnavailableException();
	}
}
