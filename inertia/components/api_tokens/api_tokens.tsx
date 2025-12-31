import { usePage } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { useState } from 'react';
import { CopyButton } from '~/components/common/copy_button';
import { SimpleTable } from '~/components/common/simple_table/simple_table';
import { useApiTokens } from '~/hooks/use_api_tokens';
import { useModals } from '~/hooks/use_modals';
import { ApiToken } from '~/types/app';
import { CreateTokenModal } from './create_token_modal';

const useGetCreatedToken = () => {
	const newlyCreatedToken = usePage<{
		token?: ApiToken;
	}>().props.token;
	return newlyCreatedToken;
};

export function ApiTokens() {
	const { tokens, createToken, revokeToken } = useApiTokens();
	const modals = useModals();

	const newlyCreatedToken = useGetCreatedToken();

	const handleCreateTokenModal = () => {
		modals.open({
			title: <Trans>Create new token</Trans>,
			children: (
				<CreateTokenModal
					onCreate={(name) => createToken(name)}
					onClose={() => modals.closeAll()}
				/>
			),
		});
	};

	const handleRevokeToken = async (tokenId: number) => {
		const token = tokens.find((t) => t.identifier === tokenId);
		if (!token) return;

		modals.openConfirmModal({
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
			confirmColor: 'red',
			onConfirm: () => revokeToken(tokenId),
		});
	};

	const generateTokenRow = (token: ApiToken) =>
		newlyCreatedToken?.identifier === token.identifier && (
			<div className="flex items-center gap-2">
				<span className="text-sm text-green-600 dark:text-green-400">
					<Trans>New token created</Trans>
				</span>
				{newlyCreatedToken.token && (
					<CopyButton value={newlyCreatedToken.token}>
						{({ copied, copy }) => (
							<button
								onClick={copy}
								className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
									copied
										? 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300'
										: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
								}`}
							>
								{copied ? <Trans>Copied</Trans> : <Trans>Copy</Trans>}
							</button>
						)}
					</CopyButton>
				)}
			</div>
		);

	const generateRow = (token: ApiToken) => ({
		key: token.identifier.toString(),
		name: token.name,
		token: generateTokenRow(token) || undefined,
		expiresAt: token.expiresAt,
		lastUsedAt: token.lastUsedAt,
		actions: [
			<button
				key="delete"
				onClick={() => handleRevokeToken(token.identifier)}
				className="p-1 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
				aria-label="Revoke token"
			>
				<div className="i-tabler-trash w-4 h-4" />
			</button>,
		],
	});

	const rows = tokens.map(generateRow);

	return (
		<>
			<modals.Modals />
			<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
						<Trans>API Tokens</Trans>
					</h2>
					<button
						onClick={handleCreateTokenModal}
						className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
					>
						<div className="i-tabler-plus w-4 h-4" />
						<Trans>Create token</Trans>
					</button>
				</div>

				{tokens.length === 0 && (
					<p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
						<Trans>No tokens created yet</Trans>
					</p>
				)}

				{tokens.length > 0 && <SimpleTable data={rows} />}
			</div>
		</>
	);
}
