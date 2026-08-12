import { Toaster as SonnerToaster } from 'sonner';

export const Toaster = () => (
	<SonnerToaster
		position="bottom-right"
		closeButton
		toastOptions={{
			unstyled: true,
			classNames: {
				toast:
					'flex items-start gap-3 w-full rounded-xl border border-rule dark:border-rule-dark bg-paper dark:bg-paper-dark p-4 shadow-xl font-sans',
				title: 'font-display text-sm text-ink dark:text-ink-dark',
				description: 'mt-1 text-sm text-ink/80 dark:text-ink-dark/80',
				actionButton:
					'rounded-lg bg-brand dark:bg-brand-dark px-3 py-1.5 text-sm font-medium text-white',
				cancelButton:
					'rounded-lg border border-rule dark:border-rule-dark px-3 py-1.5 text-sm text-ink dark:text-ink-dark',
				closeButton:
					'!border-rule dark:!border-rule-dark !bg-paper dark:!bg-paper-dark !text-ink dark:!text-ink-dark',
				success: '!border-green-500/40',
				error: '!border-red-500/40',
			},
		}}
	/>
);
