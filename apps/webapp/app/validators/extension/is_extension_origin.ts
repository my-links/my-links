/**
 * Whether an `Origin` header belongs to a browser extension page.
 *
 * Chromium extension pages holding a host permission bypass CORS outright —
 * no preflight, no `Origin` header, nothing for the server to allow. Firefox
 * sends the request as an ordinary cross-origin one, so the API has to answer
 * for itself. Hence this predicate: it exists because of Firefox, not because
 * the API wants to be callable from the open web.
 *
 * Only the scheme is checked, never the extension id. Pinning ids would buy
 * nothing — every route this gates is bearer-token authenticated, and the
 * policy that uses this predicate sends no credentials, so an extension
 * without a token reaches exactly the same 401 an anonymous caller does.
 */
const EXTENSION_ORIGIN_PROTOCOLS = ['chrome-extension:', 'moz-extension:'];

export function isExtensionOrigin(origin: string): boolean {
	let protocol: string;
	try {
		protocol = new URL(origin).protocol;
	} catch {
		// An unparseable Origin is simply not an extension origin. Nothing is
		// being swallowed here: malformed input is the answer, not an error.
		return false;
	}

	return EXTENSION_ORIGIN_PROTOCOLS.includes(protocol);
}
