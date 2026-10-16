import env from '#start/env';
import type { ExtensionBrowser } from '#constants/extension';
import { resolveAllowedExtensionHosts } from '#lib/extension/extension_ids';
import { resolveExtensionBrowser } from '#validators/extension/resolve_extension_browser';
import { InvalidExtensionRedirectUriException } from '#exceptions/extension/invalid_extension_redirect_uri_exception';

export class ExtensionCallbackService {
	private readonly allowedHosts = resolveAllowedExtensionHosts(
		env.get('EXTENSION_IDS')
	);

	assertTrusted(redirectUri: string): ExtensionBrowser {
		const browser = resolveExtensionBrowser(redirectUri, this.allowedHosts);
		if (!browser) {
			throw new InvalidExtensionRedirectUriException(
				`Refusing to redirect to untrusted extension callback: ${redirectUri}`
			);
		}
		return browser;
	}
}
