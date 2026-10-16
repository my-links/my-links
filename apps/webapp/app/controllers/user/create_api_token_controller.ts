import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { resolveExpiryDate } from '#lib/api/tokens/expiry';
import { DEFAULT_API_TOKEN_EXPIRY } from '#constants/api_token';
import { ApiTokenService } from '#services/user/api_token_service';
import { createApiTokenValidator } from '#validators/user/token/create_api_token';

@inject()
export default class CreateApiTokenController {
	constructor(protected readonly apiTokenService: ApiTokenService) {}

	async execute({ request, response, auth, session }: HttpContext) {
		const {
			name,
			expiry = DEFAULT_API_TOKEN_EXPIRY,
			scope,
		} = await request.validateUsing(createApiTokenValidator);

		const token = await this.apiTokenService.createToken(auth.getUserOrFail(), {
			name,
			expiresAt: resolveExpiryDate(expiry),
			scope,
		});

		// The only moment the secret exists in readable form: it is flashed so
		// the settings page can show it once and never again.
		session.flash('token', {
			...token.toJSON(),
			token: token.value?.release(),
			identifier: token.identifier,
		});

		return response.redirect().withQs().back();
	}
}
