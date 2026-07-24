import { useState } from 'react';

import { connectToInstance } from '@/lib/api/auth';
import { useSyncStatus } from '@/hooks/use_sync_status';
import { requestBackgroundSync } from '@/lib/sync/messages';
import { INITIAL_SYNC_BACKOFF_STATE } from '@/lib/sync/backoff';
import { authInvalidStorage, syncBackoffStorage } from '@/lib/storage';

interface SyncStatusBadgeProps {
	instanceUrl: string;
}

/**
 * Sits next to the instance name in the workspace header. Stays invisible
 * while syncs succeed; surfaces a distinct reconnect prompt when the token
 * is rejected (401), and a plain "Stale" marker for any other sync failure
 * (server unreachable, network down) where the cached data is just old.
 */
export function SyncStatusBadge({
	instanceUrl,
}: Readonly<SyncStatusBadgeProps>) {
	const { isStale, isAuthInvalid } = useSyncStatus();
	const [isReconnecting, setIsReconnecting] = useState(false);

	if (isAuthInvalid) {
		const handleReconnect = async () => {
			setIsReconnecting(true);
			try {
				await connectToInstance(instanceUrl);
				// The reconnect stored a fresh token — clear the dead-token state
				// and the backoff so the next sync runs immediately instead of
				// waiting out the delay accumulated while the token was invalid.
				await syncBackoffStorage.setValue(INITIAL_SYNC_BACKOFF_STATE);
				await authInvalidStorage.setValue(false);
				requestBackgroundSync();
			} catch {
				// launchWebAuthFlow was cancelled or refused — leave the badge up.
			} finally {
				setIsReconnecting(false);
			}
		};

		return (
			<span
				role="status"
				className="flex flex-shrink-0 items-center gap-1.5 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200"
			>
				Session expired
				<button
					type="button"
					onClick={() => void handleReconnect()}
					disabled={isReconnecting}
					className="underline underline-offset-2 disabled:opacity-60"
				>
					{isReconnecting ? 'Reconnecting…' : 'Reconnect'}
				</button>
			</span>
		);
	}

	if (isStale) {
		return (
			<span
				role="status"
				className="flex-shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200"
			>
				Stale
			</span>
		);
	}

	return null;
}
