import { isTimeoutError } from '#lib/favicons/timeout_error';

export const MAX_SUMMARY_LENGTH = 500;
const MAX_LISTED_ATTEMPTS = 6;
const ATTEMPT_SEPARATOR = '; ';
const DATA_URI_LABEL = 'data URI';
const MAX_LABEL_LENGTH = 60;

export function describeFailure(error: unknown): string {
	if (isTimeoutError(error)) {
		return 'timeout';
	}

	if (!(error instanceof Error)) {
		return String(error);
	}

	// undici reports transport failures as `TypeError: fetch failed` with the real code on `cause`.
	const causeCode = (error.cause as { code?: unknown } | undefined)?.code;
	return typeof causeCode === 'string' ? causeCode : error.message;
}

export function labelCandidate(candidateUrl: string): string {
	if (candidateUrl.startsWith('data:')) {
		return DATA_URI_LABEL;
	}

	try {
		const { pathname } = new URL(candidateUrl);
		return pathname.slice(0, MAX_LABEL_LENGTH);
	} catch {
		return candidateUrl.slice(0, MAX_LABEL_LENGTH);
	}
}

export function summarizeAttempts(attempts: string[]): string {
	if (attempts.length === 0) {
		return 'no favicon candidates';
	}

	const listed = attempts.slice(0, MAX_LISTED_ATTEMPTS);
	const omittedCount = attempts.length - listed.length;
	const summary = [
		...listed,
		...(omittedCount > 0 ? [`+${omittedCount} more`] : []),
	].join(ATTEMPT_SEPARATOR);

	return summary.slice(0, MAX_SUMMARY_LENGTH);
}
