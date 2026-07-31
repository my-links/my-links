import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { SessionService } from '#services/user/session_service';
import { ApiTokenService } from '#services/user/api_token_service';
import OauthAuthTransformer from '#transformers/oauth_auth_transformer';
import { MINIMUM_PASSWORD_LENGTH } from '#validators/auth/password_rules';
import { ProviderLinkService } from '#services/auth/provider_link_service';
import UserSessionTransformer from '#transformers/user_session_transformer';

@inject()
export default class ShowUserSettingsController {
	constructor(
		protected readonly apiTokenService: ApiTokenService,
		protected readonly sessionService: SessionService,
		protected readonly providerLinkService: ProviderLinkService
	) {}

	public async render({ auth, inertia }: HttpContext) {
		const user = await auth.authenticate();
		const tokens = await this.apiTokenService.getTokens(user);
		const sessions = await this.sessionService.getSessions(user);
		const authMethods =
			await this.providerLinkService.describeAuthMethods(user);
		return inertia.render('user_settings/show', {
			user,
			// Which of the two password forms to render. Both endpoints refuse
			// the state they do not describe, so this only picks what is shown.
			hasPassword: authMethods.hasPassword,
			linkedProviders: OauthAuthTransformer.transform(
				authMethods.linkedProviders
			),
			// The anti-lockout rule is answered here rather than recomputed in the
			// page, so the button and the service that refuses agree by
			// construction.
			canUnlinkProvider: authMethods.isAnyProviderUnlinkable,
			minimumPasswordLength: MINIMUM_PASSWORD_LENGTH,
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
