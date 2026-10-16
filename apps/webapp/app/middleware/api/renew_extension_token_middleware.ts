import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';

import { ApiTokenService } from '#services/user/api_token_service';

/**
 * Runs after the api guard has authenticated the request, so the current
 * access token is the one the caller presented.
 */
@inject()
export default class RenewExtensionTokenMiddleware {
	constructor(protected readonly apiTokenService: ApiTokenService) {}

	async handle(ctx: HttpContext, next: NextFn) {
		const currentAccessToken = ctx.auth.use('api').user?.currentAccessToken;
		if (currentAccessToken) {
			await this.apiTokenService.renewExtensionToken(currentAccessToken);
		}

		return next();
	}
}
