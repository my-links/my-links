import { Trans } from '@lingui/react/macro';

import { formatDate } from '~/lib/format';
import type { ApiToken } from '~/hooks/use_api_tokens';
import { NaContent } from '~/components/common/na_content';
import { NewTokenCell } from '~/components/api_tokens/new_token_cell';
import { DataTable } from '~/components/common/data_table/data_table';
import { RevokeTokenButton } from '~/components/api_tokens/revoke_token_button';

const CELL_CLASS_NAME = 'px-4 py-3 text-sm text-gray-900 dark:text-gray-100';

type ApiTokensTableProps = {
	tokens: ApiToken[];
	newlyCreatedToken: ApiToken | undefined;
	onRevoke: (tokenId: number) => Promise<void>;
};

export function ApiTokensTable({
	tokens,
	newlyCreatedToken,
	onRevoke,
}: Readonly<ApiTokensTableProps>) {
	const getRowKey = (token: ApiToken) => String(token.identifier);

	const renderTokenCell = (token: ApiToken) =>
		newlyCreatedToken?.identifier === token.identifier ? (
			<NewTokenCell newlyCreatedToken={newlyCreatedToken} />
		) : (
			<NaContent />
		);

	return (
		<DataTable<ApiToken>
			data={tokens}
			getRowKey={getRowKey}
			containerStyle={{ maxHeight: 300 }}
			minWidthClassName="min-w-[700px]"
			tableClassName="w-full"
			theadClassName="bg-white dark:bg-gray-800"
			tbodyClassName="bg-white dark:bg-gray-800"
			bordered={false}
			headerCellClassName="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
			columns={[
				{
					key: 'name',
					header: <Trans>Name</Trans>,
					cellClassName: CELL_CLASS_NAME,
					render: (token) => token.name ?? <NaContent />,
				},
				{
					key: 'abilities',
					header: <Trans>Access</Trans>,
					cellClassName: CELL_CLASS_NAME,
					render: (token) =>
						token.abilities.includes('*') ? (
							<Trans>Full access</Trans>
						) : (
							<Trans>Read only</Trans>
						),
				},
				{
					key: 'token',
					header: <Trans>Token</Trans>,
					cellClassName: CELL_CLASS_NAME,
					render: renderTokenCell,
				},
				{
					key: 'createdAt',
					header: <Trans>Created at</Trans>,
					cellClassName: CELL_CLASS_NAME,
					render: (token) =>
						token.createdAt ? formatDate(token.createdAt) : <NaContent />,
				},
				{
					key: 'expiresAt',
					header: <Trans>Expires at</Trans>,
					cellClassName: CELL_CLASS_NAME,
					render: (token) =>
						token.expiresAt ? formatDate(token.expiresAt) : <NaContent />,
				},
				{
					key: 'lastUsedAt',
					header: <Trans>Last used at</Trans>,
					cellClassName: CELL_CLASS_NAME,
					render: (token) =>
						token.lastUsedAt ? formatDate(token.lastUsedAt) : <NaContent />,
				},
				{
					key: 'actions',
					header: <Trans>Actions</Trans>,
					cellClassName: CELL_CLASS_NAME,
					render: (token) => (
						<RevokeTokenButton tokenId={token.identifier} onRevoke={onRevoke} />
					),
				},
			]}
		/>
	);
}
