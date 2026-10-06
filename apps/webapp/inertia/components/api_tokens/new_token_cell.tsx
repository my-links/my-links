import { Trans } from '@lingui/react/macro';
import { Button, CopyButton } from '@minimalstuff/ui';

import type { ApiToken } from '~/hooks/use_api_tokens';

type NewTokenCellProps = {
	newlyCreatedToken: ApiToken;
};

export const NewTokenCell = ({
	newlyCreatedToken,
}: Readonly<NewTokenCellProps>) => (
	<div className="flex items-center gap-2">
		<span className="text-sm text-green-600 dark:text-green-400">
			<Trans>New token created</Trans>
		</span>
		{newlyCreatedToken.token && (
			<CopyButton value={newlyCreatedToken.token}>
				{({ copied, copy }) => {
					const handleCopy = () => void copy();

					return (
						<Button
							size="sm"
							variant={copied ? 'outline' : 'solid'}
							color={copied ? 'neutral' : 'primary'}
							onClick={handleCopy}
							className={
								copied
									? 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800'
									: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
							}
						>
							{copied ? <Trans>Copied</Trans> : <Trans>Copy</Trans>}
						</Button>
					);
				}}
			</CopyButton>
		)}
	</div>
);
