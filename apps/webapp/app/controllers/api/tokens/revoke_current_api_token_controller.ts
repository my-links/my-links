import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { UnAuthorizedException } from '#exceptions/api/tokens/un_authorized_exception';
import { ApiTokenService } from '#services/user/api_token_service';

@inject()
export default class RevokeCurrentApiTokenController {
	constructor(protected readonly apiTokenService: ApiTokenService) {}

	async execute({ auth, response }: HttpContext) {
		const user = auth.use('api').user;
		const currentAccessToken = user?.currentAccessToken;
		if (!user || !currentAccessToken) {
			throw new UnAuthorizedException();
		}

		await this.apiTokenService.revokeToken(
			user,
			String(currentAccessToken.identifier)
		);

		return response.noContent();
	}
}
