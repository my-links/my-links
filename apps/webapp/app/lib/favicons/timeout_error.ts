export function isTimeoutError(error: unknown): boolean {
	return (
		error instanceof Error &&
		(error.name === 'AbortError' || error.name === 'TimeoutError')
	);
}
