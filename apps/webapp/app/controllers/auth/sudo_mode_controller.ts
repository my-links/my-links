import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import User from '#models/user';
import { AUTH_PROVIDER } from '#constants/auth';
import { resolveRequestOrigin } from '#lib/request_origin';
import { PasswordService } from '#services/auth/password_service';
import { SudoModeService } from '#services/auth/sudo_mode_service';
import { OauthAccountService } from '#services/auth/oauth_account_service';
import { GoogleAuthConfigService } from '#services/auth/google_auth_config_service';
import { sudoConfirmationValidator } from '#validators/auth/sudo_confirmation_validator';

@inject()
export default class SudoModeController {
	constructor(
		protected readonly sudoModeService: SudoModeService,
		protected readonly passwordService: PasswordService,
		protected readonly oauthAccountService: OauthAccountService,
		protected readonly googleAuthConfigService: GoogleAuthConfigService
	) {}

	/**
	 * The prompt offers whichever proofs the account actually owns. An account
	 * with only a Google identity has no password to type, and one on an
	 * instance where Google was switched off has no round trip to take — the
	 * page states what is available rather than assuming.
	 */
	async render({ auth, inertia }: HttpContext) {
		const user = auth.getUserOrFail();

		return inertia.render('auth/sudo', {
			hasPassword: await this.passwordService.hasPassword(user),
			isGoogleConfirmationAvailable:
				await this.isGoogleConfirmationAvailable(user),
		});
	}

	async execute(ctx: HttpContext) {
		const { password } = await ctx.request.validateUsing(
			sudoConfirmationValidator
		);
		const user = ctx.auth.getUserOrFail();
		const attempt = {
			userId: user.id,
			origin: resolveRequestOrigin(ctx),
		};

		const isPasswordValid = await this.passwordService.verify(user, password);
		if (!isPasswordValid) {
			return this.sudoModeService.refuse(attempt);
		}

		await this.sudoModeService.grant(ctx.session, attempt);

		return ctx.response
			.redirect()
			.toPath(this.sudoModeService.takeReturnUrl(ctx.session));
	}

	private async isGoogleConfirmationAvailable(user: User): Promise<boolean> {
		if (!this.googleAuthConfigService.isEnabled) return false;

		return this.oauthAccountService.hasLinkedProvider(
			user,
			AUTH_PROVIDER.GOOGLE
		);
	}
}
