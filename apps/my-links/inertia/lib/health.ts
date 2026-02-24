import type { HealthCheckStatus } from '#shared/types/dto';

export function getHealthStatusVariant(
	status: HealthCheckStatus
): 'success' | 'danger' | 'warning' {
	if (status === 'ok' || status === 'healthy') return 'success';
	if (status === 'failed' || status === 'unhealthy') return 'danger';
	return 'warning';
}

export function getHealthStatusIcon(status: HealthCheckStatus): string {
	if (status === 'ok' || status === 'healthy') return 'i-mdi-check-circle';
	if (status === 'failed' || status === 'unhealthy')
		return 'i-mdi-close-circle';
	return 'i-mdi-alert-circle';
}

export function getHealthStatusLabel(status: HealthCheckStatus): string {
	if (status === 'ok' || status === 'healthy') return 'Opérationnel';
	if (status === 'failed' || status === 'unhealthy') return 'Défaillant';
	return 'Avertissement';
}

export function getHealthStatusColorClass(status: HealthCheckStatus): string {
	if (status === 'ok' || status === 'healthy')
		return 'text-green-600 dark:text-green-400';
	if (status === 'failed' || status === 'unhealthy')
		return 'text-red-600 dark:text-red-400';
	return 'text-yellow-600 dark:text-yellow-400';
}

export function getHealthServiceDisplayName(name: string): string {
	const normalizedName = name.toLowerCase();

	if (
		normalizedName.includes('disk space') ||
		normalizedName === 'disk_space'
	) {
		return 'Espace disque';
	}
	if (
		normalizedName.includes('heap memory') ||
		normalizedName === 'heap_memory'
	) {
		return 'Mémoire heap';
	}
	if (normalizedName.includes('rss') || normalizedName === 'resource_memory') {
		return 'Mémoire RSS';
	}
	if (
		normalizedName.includes('db connection count') ||
		normalizedName === 'db_connection_count'
	) {
		return 'Connexions base de données';
	}
	if (
		normalizedName.includes('db connection') &&
		!normalizedName.includes('count')
	) {
		return 'Connexion base de données';
	}
	if (
		normalizedName.includes('redis memory') ||
		normalizedName.includes('memory consumption')
	) {
		return 'Utilisation mémoire Redis';
	}
	if (normalizedName.includes('redis')) {
		return 'Redis';
	}

	return name
		.replace(/health check/gi, '')
		.replace(/\(.*?\)/g, '')
		.trim()
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (l) => l.toUpperCase());
}
