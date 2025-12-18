import { AUTHOR_GITHUB_URL, AUTHOR_NAME } from '#config/project';
import { Trans } from '@lingui/react/macro';

interface MadeByProps {
	onClick?: () => void;
	className?: string;
}

export const MadeBy = ({ onClick, className = '' }: MadeByProps) => (
	<span className={`flex items-center gap-2 ${className}`}>
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
