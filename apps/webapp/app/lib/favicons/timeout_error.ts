const IMPIT_SIGNAL_ABORT_MESSAGE =
	'impit: Request was aborted through AbortSignal';

export function isTimeoutError(error: unknown): boolean {
	return (
		error instanceof Error &&
		(error.name === 'AbortError' ||
			error.name === 'TimeoutError' ||
			isImpitSignalAbort(error))
	);
}

// impit rejects body reads aborted by the signal with a plain Error.
function isImpitSignalAbort(error: Error): boolean {
	return error.message.startsWith(IMPIT_SIGNAL_ABORT_MESSAGE);
}
