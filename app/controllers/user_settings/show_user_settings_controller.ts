import { ApiTokenService } from '#services/user/api_token_service';
import { SessionService } from '#services/user/session_service';
import UserSessionTransformer from '#transformers/user_session_transformer';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export default class ShowUserSettingsController {
	constructor(
		protected readonly apiTokenService: ApiTokenService,
		protected readonly sessionService: SessionService
	) {}

	public async render({ auth, inertia }: HttpContext) {
		const user = await auth.authenticate();
		const tokens = await this.apiTokenService.getTokens(user);
		const sessions = await this.sessionService.getSessions(user);
		return inertia.render('user_settings/show', {
			user,
			tokens: tokens.map((token) => {
				return {
					...token.toJSON(),
					identifier: token.identifier,
				};
			}),
			sessions: UserSessionTransformer.transform(sessions),
		});
	}
}
