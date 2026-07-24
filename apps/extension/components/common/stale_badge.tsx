import { useSyncStatus } from '@/hooks/use_sync_status';

export function StaleBadge() {
	const { isStale } = useSyncStatus();

	if (!isStale) {
		return null;
	}

	return (
		<span
			role="status"
			className="flex-shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200"
		>
			Stale
		</span>
	);
}
