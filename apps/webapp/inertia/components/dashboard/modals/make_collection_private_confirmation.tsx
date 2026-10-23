import { plural } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

type MakeCollectionPrivateConfirmationProps = {
	followersCount: number;
};

export const MakeCollectionPrivateConfirmation = ({
	followersCount,
}: Readonly<MakeCollectionPrivateConfirmationProps>) => (
	<div className="space-y-4">
		<p className="text-sm text-amber-700 dark:text-amber-400">
			{plural(followersCount, {
				one: '# follower will lose access to this collection',
				other: '# followers will lose access to this collection',
			})}
		</p>
		<p className="text-xs text-gray-500 dark:text-gray-400">
			<Trans>Making it public again will not bring them back.</Trans>
		</p>
	</div>
);
