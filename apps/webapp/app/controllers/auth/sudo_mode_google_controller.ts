import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { AUTH_PROVIDER } from '#constants/auth';
import { SudoModeService } from '#services/auth/sudo_mode_service';
import { redirectToOauthProvider } from '#lib/auth/oauth_redirect';
import { OauthAccountService } from '#services/auth/oauth_account_service';
import { GoogleAuthConfigService } from '#services/auth/google_auth_config_service';
import GoogleAuthDisabledException from '#exceptions/auth/google_auth_disabled_exception';
import SudoConfirmationFailedException from '#exceptions/auth/sudo_confirmation_failed_exception';

/**
 * Starts the round trip an account with no password takes to prove itself.
 *
 * This is the other half of the migration path: an account that only ever
 * signed in with Google has to be able to reach the "set a password" form, and
 * the provider it already trusts is the only proof it can give.
 */
@inject()
export default class SudoModeGoogleController {
	constructor(
		protected readonly sudoModeService: SudoModeService,
		protected readonly oauthAccountService: OauthAccountService,
		protected readonly googleAuthConfigService: GoogleAuthConfigService
	) {}

	async execute(ctx: HttpContext) {
		if (!this.googleAuthConfigService.isEnabled) {
			throw new GoogleAuthDisabledException();
		}

		const user = ctx.auth.getUserOrFail();
		const isGoogleLinked = await this.oauthAccountService.hasLinkedProvider(
			user,
			AUTH_PROVIDER.GOOGLE
		);
		if (!isGoogleLinked) {
			throw new SudoConfirmationFailedException();
		}

		// Armed before leaving, because the callback URL is the one Google was
		// configured with — the flag is what tells the shared callback that the
		// identity coming back confirms a session instead of opening one.
		this.sudoModeService.startOauthConfirmation(ctx.session);

		const redirectUrl = await ctx.ally.use('google').redirectUrl();

		return redirectToOauthProvider(ctx, redirectUrl);
	}
}
