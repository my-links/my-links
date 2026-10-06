import { Trans } from '@lingui/react/macro';
import { ConfirmModal, Modal } from '@minimalstuff/ui';

import { useApiTokens } from '~/hooks/use_api_tokens';
import { CreateTokenModal } from '~/components/api_tokens/create_token_modal';

type UseApiTokenModalsReturn = {
	handleCreateTokenModal: () => void;
	handleRevokeToken: (tokenId: number) => Promise<void>;
};

export function useApiTokenModals(): UseApiTokenModalsReturn {
	const { tokens, createToken, revokeToken } = useApiTokens();

	const handleCreateTokenModal = () => {
		const call = Modal.call({
			title: <Trans>Create new token</Trans>,
			children: (
				<CreateTokenModal
					onCreate={(name, scope) => createToken(name, scope)}
					onClose={() => Modal.end(call, undefined)}
				/>
			),
		});
	};

	const handleRevokeToken = async (tokenId: number) => {
		const token = tokens.find((t) => t.identifier === tokenId);
		if (!token) return;

		await ConfirmModal.call({
			title: (
				<>
					<Trans>Revoke</Trans> "<strong>{token.name}</strong>"
				</>
			),
			children: (
				<p className="text-sm text-gray-600 dark:text-gray-300">
					<Trans>Are you sure you want to revoke this token?</Trans>
				</p>
			),
			confirmLabel: <Trans>Revoke</Trans>,
			cancelLabel: <Trans>Cancel</Trans>,
			confirmColor: 'danger',
			onConfirm: () => revokeToken(tokenId),
		});
	};

	return { handleCreateTokenModal, handleRevokeToken };
}
