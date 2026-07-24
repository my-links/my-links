export const REQUEST_SYNC_MESSAGE_TYPE = 'mylinks:request-sync' as const;

interface RequestSyncMessage {
	type: typeof REQUEST_SYNC_MESSAGE_TYPE;
}

export function isRequestSyncMessage(
	message: unknown
): message is RequestSyncMessage {
	return (
		typeof message === 'object' &&
		message !== null &&
		'type' in message &&
		message.type === REQUEST_SYNC_MESSAGE_TYPE
	);
}

/**
 * Fire-and-forget nudge sidebars send on mount so a freshly opened window
 * doesn't wait for the next alarm tick to see live data — the background
 * worker still owns backoff/mutex, this just wakes it early.
 */
export function requestBackgroundSync(): void {
	void browser.runtime.sendMessage({
		type: REQUEST_SYNC_MESSAGE_TYPE,
	} satisfies RequestSyncMessage);
}
