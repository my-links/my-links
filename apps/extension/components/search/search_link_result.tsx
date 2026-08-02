import clsx from 'clsx';

import type { SearchResult } from '@/lib/api/types';
import { useInstanceUrl } from '@/hooks/use_instance_url';
import { Highlight } from '@/components/common/highlight';
import { LinkFavicon } from '@/components/collections/link_favicon';
import { buildFaviconUrl, buildVisitUrl } from '@/lib/instance_urls';

const ROW_CLASS =
	'flex items-center gap-2 rounded-md border-l-2 border-transparent px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800';

const ROW_SELECTED_CLASS =
	'border-blue-500 bg-blue-50 text-blue-900 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-100';

interface SearchLinkResultProps {
	result: SearchResult;
	searchTerm: string;
	resultIndex: number;
	isSelected: boolean;
	onActivate: () => void;
}

export function SearchLinkResult({
	result,
	searchTerm,
	resultIndex,
	isSelected,
	onActivate,
}: Readonly<SearchLinkResultProps>) {
	const instanceUrl = useInstanceUrl();

	if (!result.url) {
		return null;
	}

	const faviconUrl = instanceUrl
		? buildFaviconUrl(instanceUrl, result.url)
		: null;
	const href = instanceUrl ? buildVisitUrl(instanceUrl, result.id) : result.url;

	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			title={result.url}
			data-result-index={resultIndex}
			aria-current={isSelected}
			onClick={onActivate}
			className={clsx(ROW_CLASS, isSelected && ROW_SELECTED_CLASS)}
		>
			{faviconUrl && instanceUrl && (
				<LinkFavicon
					key={faviconUrl}
					faviconUrl={faviconUrl}
					instanceUrl={instanceUrl}
				/>
			)}
			<span className="flex-1 truncate">
				<Highlight text={result.name} searchTerm={searchTerm} />
			</span>
		</a>
	);
}
