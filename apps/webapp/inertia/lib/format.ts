import { plural, t } from '@lingui/core/macro';

export function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export function formatPercentage(value: number): string {
	return `${value.toFixed(1)}%`;
}

type RelativeUnit = 'minute' | 'hour' | 'day';

function formatRelative(
	value: number,
	unit: RelativeUnit,
	isPast: boolean
): string {
	if (unit === 'minute') {
		return isPast
			? t`${plural(value, { one: '# minute', other: '# minutes' })} ago`
			: t`In ${plural(value, { one: '# minute', other: '# minutes' })}`;
	}

	if (unit === 'hour') {
		return isPast
			? t`${plural(value, { one: '# hour', other: '# hours' })} ago`
			: t`In ${plural(value, { one: '# hour', other: '# hours' })}`;
	}

	return isPast
		? t`${plural(value, { one: '# day', other: '# days' })} ago`
		: t`In ${plural(value, { one: '# day', other: '# days' })}`;
}

export function formatDate(date: string): string {
	const d = new Date(date);
	const now = new Date();
	const diffMs = d.getTime() - now.getTime();
	const absMs = Math.abs(diffMs);
	const isPast = diffMs <= 0;

	const seconds = Math.floor(absMs / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (seconds < 60) return isPast ? t`Just now` : t`In less than a minute`;
	if (minutes < 60) return formatRelative(minutes, 'minute', isPast);
	if (hours < 24) return formatRelative(hours, 'hour', isPast);
	if (days < 7) return formatRelative(days, 'day', isPast);

	return d.toLocaleDateString();
}
