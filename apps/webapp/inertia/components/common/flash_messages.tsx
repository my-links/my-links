import { useFlashMessages } from '~/hooks/use_flash_messages';

const TONE_CLASSNAMES = {
	error:
		'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300',
	success:
		'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900 text-green-700 dark:text-green-300',
} as const;

type FlashMessageProps = {
	readonly tone: keyof typeof TONE_CLASSNAMES;
	readonly message: string;
};

function FlashMessage({ tone, message }: Readonly<FlashMessageProps>) {
	return (
		<p
			role={tone === 'error' ? 'alert' : 'status'}
			className={`rounded-lg border px-4 py-3 text-sm shadow-sm ${TONE_CLASSNAMES[tone]}`}
		>
			{message}
		</p>
	);
}

/**
 * Renders whatever the server flashed for this request. Refusals raised as
 * self-handling exceptions — `E_INVALID_CREDENTIALS` and ours — land in the
 * `error` bag without a controller writing a line, and this is what makes them
 * visible.
 */
export function FlashMessages() {
	const { error, success } = useFlashMessages();

	if (!error && !success) {
		return null;
	}

	return (
		<div className="fixed inset-x-0 top-4 z-50 mx-auto flex w-full max-w-md flex-col gap-2 px-4">
			{error && <FlashMessage tone="error" message={error} />}
			{success && <FlashMessage tone="success" message={success} />}
		</div>
	);
}
