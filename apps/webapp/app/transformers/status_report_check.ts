import { BaseTransformer } from '@adonisjs/core/transformers';
import type { HealthCheckReport } from '@adonisjs/core/types/health';

/**
 * Taken from the health runner rather than spelled out again: a hand-written
 * union drifts, and the client then renders a status the server never sends
 * while quietly defaulting the ones it does.
 */
export type HealthCheckStatus = HealthCheckReport['checks'][number]['status'];

export type ThresholdReading = {
	used: number;
	warningThreshold: number;
	failureThreshold: number;
};

export type HealthCheckMeta = {
	sizeInPercentage?: ThresholdReading;
	memoryInBytes?: ThresholdReading;
	connectionsCount?: {
		active: number;
		warningThreshold: number;
		failureThreshold: number;
	};
};

export interface StatusReportCheck {
	name: string;
	status: HealthCheckStatus;
	message: string;
	meta?: HealthCheckMeta;
}

export default class StatusReportCheckTransformer extends BaseTransformer<StatusReportCheck> {
	toObject() {
		const check = this.resource;

		return {
			name: check.name,
			status: check.status,
			message: check.message,
			meta: check.meta,
		};
	}
}
