import { t } from '@lingui/core/macro';
import { IconButton } from '@minimalstuff/ui';

import { cn } from '~/lib/cn';

const TONE_CLASSNAMES = {
	error:
		'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300',
	success:
		'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900 text-green-700 dark:text-green-300',
} as const;

export type FlashMessageTone = keyof typeof TONE_CLASSNAMES;

interface FlashMessageProps {
	readonly tone: FlashMessageTone;
	readonly message: string;
	readonly onDismiss: () => void;
}

export const FlashMessage = ({
	tone,
	message,
	onDismiss,
}: Readonly<FlashMessageProps>) => (
	<div
		role={tone === 'error' ? 'alert' : 'status'}
		className={cn(
			'flex items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-sm',
			TONE_CLASSNAMES[tone]
		)}
	>
		<p className="flex-1">{message}</p>
		<IconButton
			icon="i-ant-design-close-outlined"
			size="sm"
			variant="unstyled"
			className="shrink-0 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
			aria-label={t`Dismiss`}
			onClick={onDismiss}
		/>
	</div>
);
