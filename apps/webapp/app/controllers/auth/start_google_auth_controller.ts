import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { GoogleAuthConfigService } from '#services/auth/google_auth_config_service';
import { GoogleAuthDisabledException } from '#exceptions/auth/google_auth_disabled_exception';

@inject()
export default class StartGoogleAuthController {
	constructor(
		protected readonly googleAuthConfigService: GoogleAuthConfigService
	) {}

	async execute(ctx: HttpContext) {
		if (!this.googleAuthConfigService.isEnabled) {
			throw new GoogleAuthDisabledException();
		}

		return ctx.ally.use('google').redirect();
	}
}
