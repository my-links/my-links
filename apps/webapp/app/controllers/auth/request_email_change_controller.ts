import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { AUTH_EVENT_TYPE } from '#constants/auth';
import { MailService } from '#services/mail/mail_service';
import { AuthEventService } from '#services/auth/auth_event_service';
import { resolveAuthEventOrigin } from '#lib/auth/auth_event_origin';
import { EmailChangeService } from '#services/auth/email_change_service';
import { requestEmailChangeValidator } from '#validators/auth/request_email_change_validator';
import EmailChangeUnavailableException from '#exceptions/auth/email_change_unavailable_exception';

/**
 * The one thing the form answers, whether or not the address is free. Exported
 * so the specs assert against the sentence the controller sends rather than a
 * copy of it.
 */
export const EMAIL_CHANGE_REQUEST_MESSAGE =
	'If that address can be used, a confirmation link is on its way to it';

@inject()
export default class RequestEmailChangeController {
	constructor(
		protected readonly emailChangeService: EmailChangeService,
		protected readonly authEventService: AuthEventService,
		protected readonly mailService: MailService
	) {}

	async execute(ctx: HttpContext) {
		this.assertEmailChangeIsAvailable();

		const { email } = await ctx.request.validateUsing(
			requestEmailChangeValidator
		);
		const user = ctx.auth.getUserOrFail();

		await this.emailChangeService.requestChange(user, email);

		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.EMAIL_CHANGE_REQUESTED,
			userId: user.id,
			...resolveAuthEventOrigin(ctx),
		});

		ctx.session.flash('success', EMAIL_CHANGE_REQUEST_MESSAGE);

		return ctx.response.redirectToNamedRoute('user.settings');
	}

	/**
	 * Both halves of this flow are links in mailboxes, so an instance with no
	 * outgoing mail does not have the feature at all — 404, the way
	 * `/forgot-password` answers there.
	 */
	private assertEmailChangeIsAvailable(): void {
		if (this.mailService.isEnabled) return;

		throw new EmailChangeUnavailableException();
	}
}
