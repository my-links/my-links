import { Toaster as SonnerToaster } from 'sonner';

export const Toaster = () => (
	<SonnerToaster
		position="bottom-right"
		closeButton
		toastOptions={{
			unstyled: true,
			classNames: {
				toast:
					'flex items-start gap-3 w-full rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800',
				title: 'text-sm text-gray-900 dark:text-gray-100',
				description: 'mt-1 text-sm text-gray-500 dark:text-gray-400',
				actionButton:
					'rounded-md bg-brand dark:bg-brand-dark px-3 py-1.5 text-sm font-medium text-white',
				cancelButton:
					'rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-900 dark:border-gray-700 dark:text-gray-100',
				closeButton:
					'!border-gray-200 !bg-white !text-gray-900 dark:!border-gray-700 dark:!bg-gray-800 dark:!text-gray-100',
				success: '!border-green-500/40',
				error: '!border-red-500/40',
			},
		}}
	/>
);
