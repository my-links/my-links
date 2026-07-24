import type { SearchResult } from '@/lib/api/types';
import { buildCollectionUrl } from '@/lib/instance_urls';
import { useInstanceUrl } from '@/hooks/use_instance_url';

interface SearchCollectionResultProps {
	result: SearchResult;
}

export function SearchCollectionResult({
	result,
}: Readonly<SearchCollectionResultProps>) {
	const instanceUrl = useInstanceUrl();
	const collectionUrl = instanceUrl
		? buildCollectionUrl(instanceUrl, result.id)
		: null;

	const icon = result.icon ? (
		<span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-base">
			{result.icon}
		</span>
	) : (
		<div className="i-ant-design-folder-outlined h-5 w-5 flex-shrink-0 text-gray-500" />
	);

	// Before `instanceUrl` hydrates from storage there's no URL to link to —
	// an `<a>` without `href` loses its link semantics (not focusable, not
	// exposed as a link to assistive tech) while still looking clickable, so
	// render inert content instead of a half-working control.
	if (!collectionUrl) {
		return (
			<div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300">
				{icon}
				<span className="flex-1 truncate">{result.name}</span>
			</div>
		);
	}

	return (
		<a
			href={collectionUrl}
			target="_blank"
			rel="noreferrer"
			className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50"
		>
			{icon}
			<span className="flex-1 truncate">{result.name}</span>
		</a>
	);
}
