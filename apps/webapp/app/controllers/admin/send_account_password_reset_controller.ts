import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { AUTH_EVENT_TYPE } from '#constants/auth';
import { UserService } from '#services/user/user_service';
import { MailService } from '#services/mail/mail_service';
import { PasswordService } from '#services/auth/password_service';
import { AuthEventService } from '#services/auth/auth_event_service';
import { recordAdminAction } from '#controllers/admin/actions/record_admin_action';
import { resolveAdminActionTarget } from '#controllers/admin/actions/resolve_admin_action_target';
import PasswordResetUnavailableException from '#exceptions/auth/password_reset_unavailable_exception';

export const PASSWORD_RESET_SENT_MESSAGE = 'A reset link is on its way';

/**
 * Mails an account a reset link, on an administrator's say-so.
 *
 * Nothing is written to the account itself: the link is what the owner
 * redeems, so an administrator who can send one still cannot take the account
 * over without reaching its mailbox. An instance with no outgoing mail does not
 * have this action at all — `node ace user:reset-password --link` prints the
 * same link for an operator to carry over.
 */
@inject()
export default class SendAccountPasswordResetController {
	constructor(
		protected readonly userService: UserService,
		protected readonly passwordService: PasswordService,
		protected readonly authEventService: AuthEventService,
		protected readonly mailService: MailService
	) {}

	async execute(ctx: HttpContext) {
		if (!this.mailService.isEnabled) {
			throw new PasswordResetUnavailableException();
		}

		const { account, administrator } = await resolveAdminActionTarget(
			ctx,
			this.userService
		);

		await this.passwordService.mailResetLink(account);

		await recordAdminAction(ctx, this.authEventService, {
			type: AUTH_EVENT_TYPE.PASSWORD_RESET_REQUESTED,
			account,
			administrator,
		});

		ctx.session.flash('success', PASSWORD_RESET_SENT_MESSAGE);

		return ctx.response.redirect().back();
	}
}
