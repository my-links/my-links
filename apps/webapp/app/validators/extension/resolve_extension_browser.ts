import type { ExtensionBrowser } from '#constants/extension';
import type { AllowedExtensionHosts } from '#lib/extension/extension_ids';

/**
 * `identity.launchWebAuthFlow()` always finishes on a reserved, per-extension
 * callback origin that only the browser itself ever resolves. The shape check
 * (https, bare host, optional path) is stacked on an allowlist of known
 * extension ids: any extension holding the `identity` permission could
 * otherwise start the flow and receive a token.
 *
 * Returns the browser the callback belongs to, or null when untrusted.
 */
const CALLBACK_PATTERN = /^https:\/\/([^/?#@:]+)(\/.*)?$/;

export function resolveExtensionBrowser(
	redirectUri: string,
	allowedHosts: AllowedExtensionHosts
): ExtensionBrowser | null {
	const host = CALLBACK_PATTERN.exec(redirectUri)?.[1];
	if (!host) return null;

	return allowedHosts.get(host) ?? null;
}
