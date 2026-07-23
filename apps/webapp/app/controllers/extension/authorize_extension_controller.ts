import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { ApiTokenService } from '#services/user/api_token_service';
import { authorizeExtensionValidator } from '#validators/extension/authorize_extension_validator';
import { isValidExtensionRedirectUri } from '#validators/extension/is_valid_extension_redirect_uri';
import InvalidExtensionRedirectUriException from '#exceptions/extension/invalid_extension_redirect_uri_exception';

const TOKEN_NAME = 'Browser extension';

@inject()
export default class AuthorizeExtensionController {
	constructor(protected readonly apiTokenService: ApiTokenService) {}

	async render({ request, response, auth }: HttpContext) {
		const { redirect_uri: redirectUri } = await request.validateUsing(
			authorizeExtensionValidator
		);

		if (!isValidExtensionRedirectUri(redirectUri)) {
			throw new InvalidExtensionRedirectUriException(
				`Refusing to redirect to untrusted extension callback: ${redirectUri}`
			);
		}

		const token = await this.apiTokenService.createToken(auth.getUserOrFail(), {
			name: TOKEN_NAME,
		});
		const tokenValue = token.value?.release();
		if (!tokenValue) {
			throw new Error('Token creation did not return a usable value');
		}

		const callbackUrl = new URL(redirectUri);
		// Fragment, not query string: it never reaches the server on the
		// redirect itself nor on any subsequent request, unlike a query param.
		callbackUrl.hash = `token=${encodeURIComponent(tokenValue)}`;

		return response.redirect().toPath(callbackUrl.toString());
	}
}
