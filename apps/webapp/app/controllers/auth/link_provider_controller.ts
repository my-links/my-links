import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { redirectToOauthProvider } from '#lib/auth/oauth_redirect';
import { GoogleAuthConfigService } from '#services/auth/google_auth_config_service';
import GoogleAuthDisabledException from '#exceptions/auth/google_auth_disabled_exception';
import {
	OAUTH_INTENT,
	OauthIntentService,
} from '#services/auth/oauth_intent_service';

/**
 * Starts the round trip that adds Google as a second way into an account that
 * already signs in with a password.
 *
 * Only the departure is provider-specific — each provider has its own driver
 * and its own configuration gate — which is why this route names Google while
 * unlinking takes the provider as a parameter.
 *
 * Sudo mode guards the route rather than the callback: the intent this arms can
 * only be minted behind that guard, and it is spent on the way back.
 */
@inject()
export default class LinkProviderController {
	constructor(
		protected readonly oauthIntentService: OauthIntentService,
		protected readonly googleAuthConfigService: GoogleAuthConfigService
	) {}

	async execute(ctx: HttpContext) {
		if (!this.googleAuthConfigService.isEnabled) {
			throw new GoogleAuthDisabledException();
		}

		this.oauthIntentService.arm(ctx.session, OAUTH_INTENT.PROVIDER_LINK);

		const redirectUrl = await ctx.ally.use('google').redirectUrl();

		return redirectToOauthProvider(ctx, redirectUrl);
	}
}
