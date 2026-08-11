import { useFlashMessages } from '~/hooks/use_flash_messages';
import { FlashMessage } from '~/components/common/flash_message';
import { useDismissibleFlashMessage } from '~/hooks/use_dismissible_flash_message';

/**
 * Renders whatever the server flashed for this request. Refusals raised as
 * self-handling exceptions — `E_INVALID_CREDENTIALS` and ours — land in the
 * `error` bag without a controller writing a line, and this is what makes them
 * visible.
 */
export function FlashMessages() {
	const { error, success } = useFlashMessages();
	const errorMessage = useDismissibleFlashMessage(error);
	const successMessage = useDismissibleFlashMessage(success);

	if (!errorMessage.visibleMessage && !successMessage.visibleMessage) {
		return null;
	}

	return (
		<div className="fixed inset-x-0 top-4 z-50 mx-auto flex w-full max-w-md flex-col gap-2 px-4">
			{errorMessage.visibleMessage && (
				<FlashMessage
					tone="error"
					message={errorMessage.visibleMessage}
					onDismiss={errorMessage.dismiss}
				/>
			)}
			{successMessage.visibleMessage && (
				<FlashMessage
					tone="success"
					message={successMessage.visibleMessage}
					onDismiss={successMessage.dismiss}
				/>
			)}
		</div>
	);
}
