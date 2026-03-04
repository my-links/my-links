import { usePage } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Button, IconButton } from '@minimalstuff/ui';
import { CopyButton } from '~/components/common/copy_button';
import { DataTable } from '~/components/common/data_table/data_table';
import { NaContent } from '~/components/common/na_content';
import { useApiTokens } from '~/hooks/use_api_tokens';
import { formatDate } from '~/lib/format';
import { useModalStore } from '~/stores/modal_store';
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
	const openModal = useModalStore((state) => state.open);
	const openConfirmModal = useModalStore((state) => state.openConfirm);
	const closeAll = useModalStore((state) => state.closeAll);

	const newlyCreatedToken = useGetCreatedToken();

	const handleCreateTokenModal = () => {
		openModal({
			title: <Trans>Create new token</Trans>,
			children: (
				<CreateTokenModal
					onCreate={(name) => createToken(name)}
					onClose={closeAll}
				/>
			),
		});
	};

	const handleRevokeToken = async (tokenId: number) => {
		const token = tokens.find((t) => t.identifier === tokenId);
		if (!token) return;

		openConfirmModal({
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
							<Button
								size="sm"
								variant={copied ? 'secondary' : 'primary'}
								onClick={copy}
								className={
									copied
										? 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800'
										: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
								}
							>
								{copied ? <Trans>Copied</Trans> : <Trans>Copy</Trans>}
							</Button>
						)}
					</CopyButton>
				)}
			</div>
		);

	return (
		<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
					<Trans>API Tokens</Trans>
				</h2>
				<Button variant="secondary" size="sm" onClick={handleCreateTokenModal}>
					<div className="i-tabler-plus w-4 h-4" />
					<Trans>Create token</Trans>
				</Button>
			</div>

			{tokens.length === 0 && (
				<p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
					<Trans>No tokens created yet</Trans>
				</p>
			)}

			{tokens.length > 0 && (
				<DataTable<ApiToken>
					data={tokens}
					getRowKey={(token) => String(token.identifier)}
					containerStyle={{ maxHeight: 300 }}
					minWidthClassName="min-w-[700px]"
					tableClassName="w-full"
					theadClassName="bg-white dark:bg-gray-800"
					tbodyClassName="bg-white dark:bg-gray-800"
					bordered={false}
					headerCellClassName="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
					columns={[
						{
							key: 'id',
							header: <Trans>ID</Trans>,
							cellClassName:
								'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
							render: (token) => token.identifier,
						},
						{
							key: 'name',
							header: <Trans>Name</Trans>,
							cellClassName:
								'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
							render: (token) => token.name ?? <NaContent />,
						},
						{
							key: 'token',
							header: <Trans>Token</Trans>,
							cellClassName:
								'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
							render: (token) => generateTokenRow(token) ?? <NaContent />,
						},
						{
							key: 'expiresAt',
							header: <Trans>Expires at</Trans>,
							cellClassName:
								'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
							render: (token) =>
								token.expiresAt ? formatDate(token.expiresAt) : <NaContent />,
						},
						{
							key: 'lastUsedAt',
							header: <Trans>Last used at</Trans>,
							cellClassName:
								'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
							render: (token) =>
								token.lastUsedAt ? formatDate(token.lastUsedAt) : <NaContent />,
						},
						{
							key: 'actions',
							header: <Trans>Actions</Trans>,
							cellClassName:
								'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
							render: (token) => (
								<IconButton
									icon="i-tabler-trash"
									onClick={() => handleRevokeToken(token.identifier)}
									aria-label="Revoke token"
									variant="danger"
									size="sm"
								/>
							),
						},
					]}
				/>
			)}
		</div>
	);
}
