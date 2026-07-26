import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { ApiTokenService } from '#services/user/api_token_service';
import { deleteApiTokenValidator } from '#validators/user/token/delete_api_token';

@inject()
export default class DeleteApiTokenController {
	constructor(protected readonly apiTokenService: ApiTokenService) {}

	async execute({ request, response, auth }: HttpContext) {
		const { params } = await request.validateUsing(deleteApiTokenValidator);

		await this.apiTokenService.revokeToken(
			auth.getUserOrFail(),
			params.tokenId
		);

		return response.redirect().withQs().back();
	}
}
