import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { ApiTokenService } from '#services/user/api_token_service';
import { createApiTokenValidator } from '#validators/user/token/create_api_token';

@inject()
export default class CreateApiTokenController {
	constructor(protected readonly apiTokenService: ApiTokenService) {}

	async execute({ request, response, auth, session }: HttpContext) {
		const { name, expiresAt } = await request.validateUsing(
			createApiTokenValidator
		);

		const token = await this.apiTokenService.createToken(auth.getUserOrFail(), {
			name,
			expiresAt: expiresAt?.toJSDate(),
		});

		// The only moment the secret exists in readable form — it is flashed so
		// the settings page can show it once and never again.
		session.flash('token', {
			...token.toJSON(),
			token: token.value?.release(),
			identifier: token.identifier,
		});

		return response.redirect().withQs().back();
	}
}
