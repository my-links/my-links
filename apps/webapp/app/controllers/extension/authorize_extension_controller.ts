import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { ApiTokenService } from '#services/user/api_token_service';
import { ExtensionCallbackService } from '#services/extension/extension_callback_service';
import { authorizeExtensionValidator } from '#validators/extension/authorize_extension_validator';
import { UnusableExtensionTokenException } from '#exceptions/extension/unusable_extension_token_exception';

const TOKEN_NAME = 'Browser extension';
const ACCESS_DENIED_FRAGMENT = 'error=access_denied';

@inject()
export default class AuthorizeExtensionController {
	constructor(
		protected readonly apiTokenService: ApiTokenService,
		protected readonly extensionCallbackService: ExtensionCallbackService
	) {}

	/**
	 * Asks for consent instead of minting: a GET with side effects would let any
	 * trusted-looking page start the flow and walk away with a token silently.
	 */
	async render({ request, inertia }: HttpContext) {
		const { redirect_uri: redirectUri } = await request.validateUsing(
			authorizeExtensionValidator
		);
		const browser = this.extensionCallbackService.assertTrusted(redirectUri);

		const cancelUrl = new URL(redirectUri);
		cancelUrl.hash = ACCESS_DENIED_FRAGMENT;

		return inertia.render('extension/authorize', {
			redirectUri,
			browser,
			cancelUrl: cancelUrl.toString(),
		});
	}

	async execute({ request, response, auth, inertia }: HttpContext) {
		const { redirect_uri: redirectUri } = await request.validateUsing(
			authorizeExtensionValidator
		);
		this.extensionCallbackService.assertTrusted(redirectUri);

		const token = await this.apiTokenService.createToken(auth.getUserOrFail(), {
			name: TOKEN_NAME,
		});
		const tokenValue = token.value?.release();
		if (!tokenValue) {
			throw new UnusableExtensionTokenException();
		}

		const callbackUrl = new URL(redirectUri);
		// Fragment, not query string: it never reaches the server on the
		// redirect itself nor on any subsequent request, unlike a query param.
		callbackUrl.hash = `token=${encodeURIComponent(tokenValue)}`;

		// The consent form is an Inertia submission: it needs a real navigation, not an XHR-followed redirect.
		if (request.header('x-inertia')) {
			inertia.location(callbackUrl.toString());
			return;
		}

		return response.redirect().toPath(callbackUrl.toString());
	}
}
