import { toast } from 'sonner';
import { useEffect } from 'react';

import { useFlashMessages } from '~/hooks/use_flash_messages';

/**
 * Surfaces whatever the server flashed for this request as a toast. Refusals
 * raised as self-handling exceptions — `E_INVALID_CREDENTIALS` and ours —
 * land in the `error` bag without a controller writing a line, and this is
 * what makes them visible.
 */
export function useFlashToast(): void {
	const { error, success } = useFlashMessages();

	useEffect(() => {
		if (error) toast.error(error);
	}, [error]);

	useEffect(() => {
		if (success) toast.success(success);
	}, [success]);
}
