export type DeliveryDiagnostics = {
	code?: string;
	responseCode?: number;
	command?: string;
};

/**
 * Nodemailer errors carry the failing recipient in `message` and `response`,
 * so only the machine-readable fields that say where the delivery broke are kept.
 */
export function pickDeliveryDiagnostics(error: unknown): DeliveryDiagnostics {
	if (typeof error !== 'object' || error === null) {
		return {};
	}

	const { code, responseCode, command } = error as Record<string, unknown>;

	return {
		...(typeof code === 'string' && { code }),
		...(typeof responseCode === 'number' && { responseCode }),
		...(typeof command === 'string' && { command }),
	};
}
