import { inject } from '@adonisjs/core';
import logger from '@adonisjs/core/services/logger';
import type { HttpContext } from '@adonisjs/core/http';

import type User from '#models/user';
import { AUTH_EVENT_TYPE } from '#constants/auth';
import { MailService } from '#services/mail/mail_service';
import { AuthEventService } from '#services/auth/auth_event_service';
import { resolveAuthEventOrigin } from '#lib/auth/auth_event_origin';
import type { AuthEventOrigin } from '#services/auth/auth_event_service';
import { RegistrationService } from '#services/auth/registration_service';
import { EmailVerificationService } from '#services/auth/email_verification_service';
import { RegistrationPolicyService } from '#services/auth/registration_policy_service';
import {
	MINIMUM_PASSWORD_LENGTH,
	registerValidator,
} from '#validators/auth/register_validator';

/**
 * The one thing a visitor is told after submitting the form. It never mentions
 * the address they typed, because the very same sentence has to answer a free
 * address and one that already has an account. Which of the two sentences an
 * instance uses depends on that instance's mail configuration, never on the
 * submission.
 */
export const REGISTRATION_CONFIRMATION_MESSAGES = {
	WITH_MAIL:
		'If that email address is available, a confirmation link is on its way to it',
	WITHOUT_MAIL:
		'If that email address is available, the account is ready — sign in below',
} as const;

@inject()
export default class RegisterController {
	constructor(
		protected readonly registrationPolicyService: RegistrationPolicyService,
		protected readonly registrationService: RegistrationService,
		protected readonly emailVerificationService: EmailVerificationService,
		protected readonly authEventService: AuthEventService,
		protected readonly mailService: MailService
	) {}

	async render({ inertia }: HttpContext) {
		await this.registrationPolicyService.assertIsOpen();

		return inertia.render('auth/register', {
			minimumPasswordLength: MINIMUM_PASSWORD_LENGTH,
		});
	}

	/**
	 * Registration never signs the visitor in. Signing in on success would make
	 * the response differ from the one a taken address gets, which is the whole
	 * property this flow is built around.
	 */
	async execute(ctx: HttpContext) {
		const payload = await ctx.request.validateUsing(registerValidator);

		const registeredUser = await this.registrationService.register(payload);
		if (registeredUser) {
			await this.welcome(registeredUser, resolveAuthEventOrigin(ctx));
		}

		ctx.session.flash('success', this.confirmationMessage());

		return ctx.response.redirectToNamedRoute('auth.login');
	}

	private async welcome(user: User, origin: AuthEventOrigin): Promise<void> {
		await this.emailVerificationService.sendVerificationLink(user);
		await this.authEventService.record({
			type: AUTH_EVENT_TYPE.REGISTERED,
			userId: user.id,
			...origin,
		});

		logger.info(`[${user.email}] registered`);
	}

	private confirmationMessage(): string {
		return this.mailService.isEnabled
			? REGISTRATION_CONFIRMATION_MESSAGES.WITH_MAIL
			: REGISTRATION_CONFIRMATION_MESSAGES.WITHOUT_MAIL;
	}
}
