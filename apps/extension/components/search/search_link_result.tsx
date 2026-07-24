import type { SearchResult } from '@/lib/api/types';
import { useInstanceUrl } from '@/hooks/use_instance_url';
import { LinkFavicon } from '@/components/collections/link_favicon';
import { buildFaviconUrl, buildVisitUrl } from '@/lib/instance_urls';

interface SearchLinkResultProps {
	result: SearchResult;
}

export function SearchLinkResult({ result }: Readonly<SearchLinkResultProps>) {
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
			className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50"
		>
			{faviconUrl && <LinkFavicon key={faviconUrl} faviconUrl={faviconUrl} />}
			<span className="flex-1 truncate">{result.name}</span>
		</a>
	);
}
