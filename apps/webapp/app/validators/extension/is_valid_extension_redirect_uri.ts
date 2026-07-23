/**
 * Chrome's `chrome.identity.launchWebAuthFlow()` always finishes on a fixed,
 * per-extension callback origin: `https://<32-char-id>.chromiumapp.org/*`.
 * Validating against this exact shape (rather than trusting any redirect_uri)
 * is what stops the auth handoff from minting a token and handing it to an
 * arbitrary third-party origin.
 *
 * Firefox uses a different reserved origin (`*.extensions.allizom.org` for
 * unsigned/dev builds) — add it here when Firefox parity lands.
 */
const CHROMIUM_EXTENSION_REDIRECT_PATTERN =
	/^https:\/\/[a-p]{32}\.chromiumapp\.org(\/.*)?$/;

export function isValidExtensionRedirectUri(redirectUri: string): boolean {
	return CHROMIUM_EXTENSION_REDIRECT_PATTERN.test(redirectUri);
}
