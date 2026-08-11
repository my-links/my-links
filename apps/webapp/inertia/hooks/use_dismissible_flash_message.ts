import { useState } from 'react';

interface UseDismissibleFlashMessageReturn {
	visibleMessage: string | undefined;
	dismiss: () => void;
}

export function useDismissibleFlashMessage(
	message: string | undefined
): UseDismissibleFlashMessageReturn {
	const [dismissedMessage, setDismissedMessage] = useState<string | null>(null);

	const isDismissed = message !== undefined && message === dismissedMessage;

	return {
		visibleMessage: isDismissed ? undefined : message,
		dismiss: () => setDismissedMessage(message ?? null),
	};
}
