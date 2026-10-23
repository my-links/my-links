import { plural } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

type MakeCollectionPublicConfirmationProps = {
	linksCount: number | undefined;
	shareUrl: string;
};

const renderLinksCountLine = (linksCount: number | undefined) => {
	if (linksCount === undefined) return null;
	if (linksCount === 0) {
		return (
			<p className="text-sm">
				<Trans>This collection has no links yet</Trans>
			</p>
		);
	}
	return (
		<p className="text-sm">
			{plural(linksCount, {
				one: '# link will become public',
				other: '# links will become public',
			})}
		</p>
	);
};

export const MakeCollectionPublicConfirmation = ({
	linksCount,
	shareUrl,
}: Readonly<MakeCollectionPublicConfirmationProps>) => (
	<div className="space-y-4">
		<p className="text-sm text-amber-700 dark:text-amber-400">
			<Trans>
				Anyone with the link will be able to see this collection and its links.
			</Trans>
		</p>
		{renderLinksCountLine(linksCount)}
		<div className="space-y-1">
			<p className="text-xs text-gray-500 dark:text-gray-400">
				<Trans>Share URL</Trans>
			</p>
			<code className="block select-all break-all rounded-md bg-gray-100 px-3 py-2 text-xs dark:bg-gray-800">
				{shareUrl}
			</code>
		</div>
		<p className="text-xs text-gray-500 dark:text-gray-400">
			<Trans>
				Switching back to private later cuts access, but it cannot undo copies
				already made.
			</Trans>
		</p>
	</div>
);
