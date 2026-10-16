const FALLBACK_STATUS = 500;

type ThrownError = { status?: number; message: string };

export type ServerErrorProps = {
	error: {
		status: number;
		message?: string;
	};
};

/**
 * The props end up in the page's `data-page` JSON, so in production they never
 * carry the thrown error: database errors expose details, constraints and SQL.
 */
export function buildServerErrorProps(
	error: ThrownError,
	isProduction: boolean
): ServerErrorProps {
	const status = error.status ?? FALLBACK_STATUS;
	if (isProduction) {
		return { error: { status } };
	}

	return { error: { status, message: error.message } };
}
