import { Trans } from '@lingui/react/macro';

import { cn } from '~/lib/cn';
import { AUTHOR_GITHUB_URL, AUTHOR_NAME } from '~/consts/project';

interface MadeByProps {
	onClick?: () => void;
	className?: string;
}

export const MadeBy = ({ onClick, className }: Readonly<MadeByProps>) => (
	<span className={cn('flex items-center gap-2', className)}>
		<Trans>Made by</Trans>
		<a
			href={AUTHOR_GITHUB_URL}
			target="_blank"
			rel="noopener noreferrer"
			className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
			onClick={onClick}
		>
			{AUTHOR_NAME}
		</a>
	</span>
);
