const BLOCK_STATUSES = new Set([401, 403, 406, 429]);
const RETRYABLE_NETWORK_ERROR_CODES = new Set([
	'UND_ERR_HEADERS_OVERFLOW',
	'UND_ERR_SOCKET',
	'ECONNRESET',
]);

export function isBlockedStatus(status: number): boolean {
	return BLOCK_STATUSES.has(status);
}

// undici reports transport failures as `TypeError: fetch failed` with the real code on `cause`.
export function isRetryableNetworkError(error: unknown): boolean {
	if (!(error instanceof Error)) {
		return false;
	}

	const code = (error.cause as { code?: unknown } | undefined)?.code;
	return typeof code === 'string' && RETRYABLE_NETWORK_ERROR_CODES.has(code);
}
