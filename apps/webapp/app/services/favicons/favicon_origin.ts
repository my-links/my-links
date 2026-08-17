// Shared by the cache key, favicon_entries, and the orphan-purge sweep so all three agree on "the same favicon".
export function normalizeFaviconOrigin(url: string): string {
	try {
		const parsed = new URL(url);
		return `${parsed.protocol}//${parsed.hostname}`.toLowerCase();
	} catch {
		return url.toLowerCase();
	}
}
