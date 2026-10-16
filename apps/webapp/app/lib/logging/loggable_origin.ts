const UNPARSABLE_URL_PLACEHOLDER = '[unparsable url]';

/**
 * Reduces a bookmarked URL to the form that is safe to record: scheme and host
 * only, never the path or query string, which routinely carry private data.
 */
export function toLoggableOrigin(url: string): string {
	try {
		const { protocol, host } = new URL(url);
		return `${protocol}//${host}`;
	} catch {
		return UNPARSABLE_URL_PLACEHOLDER;
	}
}
