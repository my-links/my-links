import { t } from '@lingui/core/macro';
import type { Data } from '@generated/data';

type HealthCheckStatus = Data.StatusReportCheck['status'];

export function getHealthStatusVariant(
	status: HealthCheckStatus
): 'success' | 'danger' | 'warning' {
	if (status === 'ok') return 'success';
	if (status === 'error') return 'danger';
	return 'warning';
}

export function getHealthStatusIcon(status: HealthCheckStatus): string {
	if (status === 'ok') return 'i-mdi-check-circle';
	if (status === 'error') return 'i-mdi-close-circle';
	return 'i-mdi-alert-circle';
}

export function getHealthStatusLabel(status: HealthCheckStatus): string {
	if (status === 'ok') return t`Operational`;
	if (status === 'error') return t`Failing`;
	return t`Warning`;
}

export function getHealthStatusColorClass(status: HealthCheckStatus): string {
	if (status === 'ok') return 'text-green-600 dark:text-green-400';
	if (status === 'error') return 'text-red-600 dark:text-red-400';
	return 'text-yellow-600 dark:text-yellow-400';
}

export function getHealthServiceDisplayName(name: string): string {
	const normalizedName = name.toLowerCase();

	if (
		normalizedName.includes('disk space') ||
		normalizedName === 'disk_space'
	) {
		return t`Disk space`;
	}
	if (
		normalizedName.includes('heap memory') ||
		normalizedName === 'heap_memory'
	) {
		return t`Heap memory`;
	}
	if (normalizedName.includes('rss') || normalizedName === 'resource_memory') {
		return t`RSS memory`;
	}
	if (
		normalizedName.includes('db connection count') ||
		normalizedName === 'db_connection_count'
	) {
		return t`Database connections`;
	}
	if (
		normalizedName.includes('db connection') &&
		!normalizedName.includes('count')
	) {
		return t`Database connection`;
	}
	if (
		normalizedName.includes('redis memory') ||
		normalizedName.includes('memory consumption')
	) {
		return t`Redis memory usage`;
	}
	if (normalizedName.includes('redis')) {
		return t`Redis`;
	}

	return name
		.replace(/health check/gi, '')
		.replace(/\(.*?\)/g, '')
		.trim()
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (l) => l.toUpperCase());
}
