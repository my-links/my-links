import { Button } from '@minimalstuff/ui';
import { Trans } from '@lingui/react/macro';

import { useApiTokens } from '~/hooks/use_api_tokens';
import { useCreatedToken } from '~/hooks/use_created_token';
import { useApiTokenModals } from '~/hooks/use_api_token_modals';
import { ApiTokensTable } from '~/components/api_tokens/api_tokens_table';

export function ApiTokens() {
	const { tokens } = useApiTokens();
	const newlyCreatedToken = useCreatedToken();
	const { handleCreateTokenModal, handleRevokeToken } = useApiTokenModals();

	return (
		<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
					<Trans>API Tokens</Trans>
				</h2>
				<Button
					variant="outline"
					color="neutral"
					size="sm"
					onClick={handleCreateTokenModal}
				>
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
				<ApiTokensTable
					tokens={tokens}
					newlyCreatedToken={newlyCreatedToken}
					onRevoke={handleRevokeToken}
				/>
			)}
		</div>
	);
}
