import { ApiTokenService } from '#user/services/api_token_service';
import { createApiTokenValidator } from '#user/validators/token/create_api_token';
import { deleteApiTokenValidator } from '#user/validators/token/delete_api_token';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';

@inject()
export default class ApiTokenController {
	constructor(private apiTokenService: ApiTokenService) {}

	async store({ request, response, auth }: HttpContext) {
		const { name, expiresAt } = await request.validateUsing(
			createApiTokenValidator
		);

		await this.apiTokenService.createToken({
			user: auth.user!,
			name,
			expiresAt: expiresAt ? DateTime.fromJSDate(expiresAt) : undefined,
		});
		return response.redirect().withQs().back();
	}

	async destroy({ request, response, auth }: HttpContext) {
		const { params } = await request.validateUsing(deleteApiTokenValidator);
		const tokenId = params.tokenId;

		await this.apiTokenService.revokeToken(tokenId, auth.user!.id);
		return response.redirect().withQs().back();
	}
}
