import { BaseTransformer } from '@adonisjs/core/transformers';

export type HealthCheckStatus =
	| 'ok'
	| 'healthy'
	| 'failed'
	| 'unhealthy'
	| 'warn'
	| 'warning';

export type HealthCheckMeta = {
	sizeInPercentage?: {
		used: number;
		warningThreshold: number;
		failureThreshold: number;
	};
	memoryInBytes?: {
		used: number;
		warningThreshold: number;
		failureThreshold: number;
	};
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
