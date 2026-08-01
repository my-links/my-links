import { Trans } from '@lingui/react/macro';

export function BrowserBarCallout() {
	return (
		<div className="mt-4 inline-flex items-center gap-3 rounded-lg border border-rule dark:border-rule-dark bg-paper dark:bg-ink px-3 py-2.5">
			<span className="i-tabler-world w-4 h-4 text-ink/30 dark:text-ink-dark/30" />
			<span className="w-32 h-2 rounded bg-rule dark:bg-rule-dark" />
			<span className="w-7 h-7 rounded flex items-center justify-center bg-brand dark:bg-brand-dark">
				<span className="i-tabler-bookmark-plus w-4 h-4 text-paper" />
			</span>
			<span className="text-xs text-ink/50 dark:text-ink-dark/50">
				<Trans>The extension, in your toolbar</Trans>
			</span>
		</div>
	);
}
