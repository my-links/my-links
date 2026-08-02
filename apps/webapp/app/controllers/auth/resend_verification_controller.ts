import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { AUTH_EVENT_TYPE } from '#constants/auth';
import { MailService } from '#services/mail/mail_service';
import { resolveRequestOrigin } from '#lib/request_origin';
import { AuthEventService } from '#services/auth/auth_event_service';
import { emailAddressValidator } from '#validators/auth/email_address_validator';
import { EmailVerificationService } from '#services/auth/email_verification_service';
import VerificationResendUnavailableException from '#exceptions/auth/verification_resend_unavailable_exception';

/**
 * The one thing a visitor is told, whether the address they typed has an
 * unconfirmed account, a confirmed one, or none at all. Exported so the specs
 * assert against the sentence the controller actually sends.
 */
export const VERIFICATION_RESEND_MESSAGE =
	'If that address needs confirming, a fresh link is on its way to it';

@inject()
export default class ResendVerificationController {
	constructor(
		protected readonly emailVerificationService: EmailVerificationService,
		protected readonly authEventService: AuthEventService,
		protected readonly mailService: MailService
	) {}

	async execute(ctx: HttpContext) {
		this.assertVerificationIsAvailable();

		const { email } = await ctx.request.validateUsing(emailAddressValidator);

		await this.emailVerificationService.resendVerificationLink(email);

		// Journaled without resolving the account, like a reset request: the
		// address is visitor-supplied, and looking it up to attribute the row
		// would put the lookup this flow refuses to answer back into the
		// request. The confirmation that follows is journaled against its user.
		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.VERIFICATION_LINK_REQUESTED,
			userId: null,
			...resolveRequestOrigin(ctx),
		});

		ctx.session.flash('success', VERIFICATION_RESEND_MESSAGE);

		return ctx.response.redirectToNamedRoute('auth.login');
	}

	private assertVerificationIsAvailable(): void {
		if (this.mailService.isEnabled) return;

		throw new VerificationResendUnavailableException();
	}
}
