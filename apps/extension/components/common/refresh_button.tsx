import { useRef, useState } from 'react';
import { IconButton } from '@minimalstuff/ui';

import { requestBackgroundSync } from '@/lib/sync/messages';

const MIN_REFRESH_INDICATOR_MS = 600;

/** Manual sync nudge — the background worker already runs on a timer, this just skips the wait. */
export function RefreshButton() {
	const [isRefreshing, setIsRefreshing] = useState(false);
	// Set once the minimum indicator time has passed; the spin itself only
	// stops on the next `animationiteration`, so it never cuts off mid-turn.
	const shouldStopAtNextIterationRef = useRef(false);

	const handleAnimationIteration = () => {
		if (shouldStopAtNextIterationRef.current) {
			shouldStopAtNextIterationRef.current = false;
			setIsRefreshing(false);
		}
	};

	const handleRefresh = () => {
		setIsRefreshing(true);
		shouldStopAtNextIterationRef.current = false;
		requestBackgroundSync();
		setTimeout(() => {
			shouldStopAtNextIterationRef.current = true;
		}, MIN_REFRESH_INDICATOR_MS);
	};

	return (
		<IconButton
			icon="i-ant-design-sync-outlined"
			aria-label="Refresh"
			size="sm"
			variant="ghost"
			className={isRefreshing ? 'animate-spin' : undefined}
			disabled={isRefreshing}
			onAnimationIteration={handleAnimationIteration}
			onClick={handleRefresh}
		/>
	);
}
