import { ApiTokenService } from '#services/user/api_token_service';
import { createApiTokenValidator } from '#validators/user/token/create_api_token';
import { deleteApiTokenValidator } from '#validators/user/token/delete_api_token';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class ApiTokenController {
	constructor(private apiTokenService: ApiTokenService) {}

	async store({ request, response, auth, session }: HttpContext) {
		const { name, expiresAt } = await request.validateUsing(
			createApiTokenValidator
		);
		const token = await this.apiTokenService.createToken(auth.user!, {
			name,
			expiresAt,
		});
		session.flash('token', {
			...token.toJSON(),
			token: token.value?.release(),
			identifier: token.identifier,
		});
		return response.redirect().withQs().back();
	}

	async destroy({ request, response, auth }: HttpContext) {
		const { params } = await request.validateUsing(deleteApiTokenValidator);
		const tokenId = params.tokenId;

		const token = await this.apiTokenService.getTokenByValue(
			auth.user!,
			tokenId
		);
		if (!token) {
			return response.notFound();
		}

		await this.apiTokenService.revokeToken(
			auth.user!,
			Number(token.identifier)
		);
		return response.redirect().withQs().back();
	}
}
