import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { AUTH_EVENT_TYPE } from '#constants/auth';
import { UserService } from '#services/user/user_service';
import { resolveRequestOrigin } from '#lib/request_origin';
import { AuthEventService } from '#services/auth/auth_event_service';
import { accountTargetValidator } from '#validators/admin/account_target_validator';
import { EmailVerificationService } from '#services/auth/email_verification_service';

export const EMAIL_MARKED_VERIFIED_MESSAGE = 'That address is now confirmed';
export const EMAIL_ALREADY_VERIFIED_MESSAGE =
	'That address was already confirmed';

/**
 * Confirms an address on an administrator's authority — the dashboard half of
 * `node ace user:verify-email`, and the way an account the sign-in gate is
 * holding out gets in when its confirmation link never arrived.
 */
@inject()
export default class VerifyAccountEmailController {
	constructor(
		protected readonly userService: UserService,
		protected readonly emailVerificationService: EmailVerificationService,
		protected readonly authEventService: AuthEventService
	) {}

	async execute(ctx: HttpContext) {
		const { id } = await ctx.request.validateUsing(accountTargetValidator, {
			data: ctx.params,
		});
		const administrator = ctx.auth.getUserOrFail();
		const account = await this.userService.findAccountOrFail(id);

		const wasConfirmed =
			await this.emailVerificationService.markVerified(account);
		if (!wasConfirmed) {
			ctx.session.flash('success', EMAIL_ALREADY_VERIFIED_MESSAGE);

			return ctx.response.redirect().back();
		}

		await this.authEventService.recordAdminAction({
			type: AUTH_EVENT_TYPE.EMAIL_VERIFIED,
			userId: account.id,
			actorId: administrator.id,
			...resolveRequestOrigin(ctx),
		});

		ctx.session.flash('success', EMAIL_MARKED_VERIFIED_MESSAGE);

		return ctx.response.redirect().back();
	}
}
