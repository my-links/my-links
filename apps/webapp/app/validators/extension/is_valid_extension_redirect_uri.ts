/**
 * `identity.launchWebAuthFlow()` always finishes on a reserved, per-extension
 * callback origin that only the browser itself ever resolves. Validating
 * against those exact shapes (rather than trusting any redirect_uri) is what
 * stops the auth handoff from minting a token and handing it to an arbitrary
 * third-party origin.
 *
 * Chromium ends on `https://<32-char-id>.chromiumapp.org/*`, built from the
 * extension id itself. Firefox ends on
 * `https://<40-hex>.extensions.allizom.org/*`, built from the SHA-1 of the
 * add-on id — hence the different length and alphabet.
 */
const EXTENSION_REDIRECT_PATTERNS = [
	/^https:\/\/[a-p]{32}\.chromiumapp\.org(\/.*)?$/,
	/^https:\/\/[0-9a-f]{40}\.extensions\.allizom\.org(\/.*)?$/,
];

export function isValidExtensionRedirectUri(redirectUri: string): boolean {
	return EXTENSION_REDIRECT_PATTERNS.some((pattern) =>
		pattern.test(redirectUri)
	);
}
