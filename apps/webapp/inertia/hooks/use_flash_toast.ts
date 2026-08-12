import { toast } from 'sonner';
import { useEffect } from 'react';

import { useFlashMessages } from '~/hooks/use_flash_messages';

/** Surfaces whatever the server flashed as a toast, including self-handling exceptions like `E_INVALID_CREDENTIALS`. */
export function useFlashToast(): void {
	const flash = useFlashMessages();

	// Depends on the flash object, not the strings, so a repeated message (e.g. throttled twice) still refires.
	useEffect(() => {
		if (flash.error) toast.error(flash.error);
		if (flash.success) toast.success(flash.success);
	}, [flash]);
}
