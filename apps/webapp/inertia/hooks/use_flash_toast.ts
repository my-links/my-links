import type { Data } from '@generated/data';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

/** Surfaces every flash as a toast, including one that repeats the previous message verbatim. */
export function useFlashToast(): void {
	useEffect(() => {
		return router.on('flash', (event) => {
			const flash = event.detail.flash as Data.FlashMessages;

			if (flash.error) toast.error(flash.error);
			if (flash.success) toast.success(flash.success);
		});
	}, []);
}
