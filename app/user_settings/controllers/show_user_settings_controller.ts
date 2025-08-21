import { ApiTokenService } from '#user/services/api_token_service';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class ShowUserSettingsController {
	constructor(private apiTokenService: ApiTokenService) {}

	public async render({ auth, inertia }: HttpContext) {
		const user = await auth.authenticate();
		const tokens = await this.apiTokenService.getUserTokens(user.id);
		return inertia.render('user_settings/show', {
			user,
			tokens,
		});
	}
}
