import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { AUTH_PROVIDER } from '#constants/auth';
import { GoogleAuthDisabledException } from '#exceptions/auth/google_auth_disabled_exception';
import { SudoConfirmationFailedException } from '#exceptions/auth/sudo_confirmation_failed_exception';
import { GoogleAuthConfigService } from '#services/auth/google_auth_config_service';
import { OauthAccountService } from '#services/auth/oauth_account_service';
import {
	OAUTH_INTENT,
	OauthIntentService,
} from '#services/auth/oauth_intent_service';

/**
 * Starts the round trip an account with no password takes to prove itself.
 *
 * This is the other half of the migration path: an account that only ever
 * signed in with Google has to be able to reach the "set a password" form, and
 * the provider it already trusts is the only proof it can give.
 */
@inject()
export default class ConfirmSudoModeWithGoogleController {
	constructor(
		protected readonly oauthIntentService: OauthIntentService,
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
		// configured with: the intent is what tells the shared callback that the
		// identity coming back confirms a session instead of opening one.
		this.oauthIntentService.arm(ctx.session, OAUTH_INTENT.SUDO_CONFIRMATION);

		return ctx.ally.use('google').redirect();
	}
}
