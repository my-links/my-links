import type { HealthCheckReport } from '@adonisjs/core/types/health';

import type {
	HealthCheckMeta,
	StatusReportCheck,
	ThresholdReading,
} from '#transformers/status_report_check';

type HealthCheckEntry = HealthCheckReport['checks'][number];

/**
 * Maps the report the health runner produces onto the shape the status page
 * consumes. The runner types its `meta` as an open bag, so the thresholds the
 * page reads are narrowed here instead of being asserted into existence —
 * a check that stops reporting one renders without it rather than crashing on
 * an undefined field.
 */
export function toStatusReportChecks(
	report: HealthCheckReport
): StatusReportCheck[] {
	return report.checks.map((check) => ({
		name: check.name,
		status: check.status,
		message: check.message,
		meta: readMeta(check.meta),
	}));
}

function readMeta(meta: HealthCheckEntry['meta']): HealthCheckMeta | undefined {
	if (!meta) {
		return undefined;
	}

	const sizeInPercentage = readThreshold(meta.sizeInPercentage, 'used');
	const memoryInBytes = readThreshold(meta.memoryInBytes, 'used');
	const connectionsCount = readThreshold(meta.connectionsCount, 'active');

	if (!sizeInPercentage && !memoryInBytes && !connectionsCount) {
		return undefined;
	}

	return {
		...(sizeInPercentage && { sizeInPercentage }),
		...(memoryInBytes && { memoryInBytes }),
		...(connectionsCount && {
			connectionsCount: {
				active: connectionsCount.used,
				warningThreshold: connectionsCount.warningThreshold,
				failureThreshold: connectionsCount.failureThreshold,
			},
		}),
	};
}

function readThreshold(
	threshold: unknown,
	amountKey: 'used' | 'active'
): ThresholdReading | null {
	if (typeof threshold !== 'object' || threshold === null) {
		return null;
	}

	const used = readNumber(threshold, amountKey);
	const warningThreshold = readNumber(threshold, 'warningThreshold');
	const failureThreshold = readNumber(threshold, 'failureThreshold');

	if (used === null || warningThreshold === null || failureThreshold === null) {
		return null;
	}

	return { used, warningThreshold, failureThreshold };
}

function readNumber(source: object, key: string): number | null {
	const value: unknown = Reflect.get(source, key);

	return typeof value === 'number' ? value : null;
}
