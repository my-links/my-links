import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { redirectToOauthProvider } from '#lib/auth/oauth_redirect';
import { GoogleAuthConfigService } from '#services/auth/google_auth_config_service';
import GoogleAuthDisabledException from '#exceptions/auth/google_auth_disabled_exception';

@inject()
export default class GoogleAuthController {
	constructor(
		protected readonly googleAuthConfigService: GoogleAuthConfigService
	) {}

	async execute(ctx: HttpContext) {
		if (!this.googleAuthConfigService.isEnabled) {
			throw new GoogleAuthDisabledException();
		}

		const redirectUrl = await ctx.ally.use('google').redirectUrl();

		return redirectToOauthProvider(ctx, redirectUrl);
	}
}
