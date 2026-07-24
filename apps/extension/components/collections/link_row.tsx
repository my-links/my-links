import { LinkFavicon } from './link_favicon';
import type { LinkResource } from '@/lib/api/types';
import { useInstanceUrl } from '@/hooks/use_instance_url';

interface LinkRowProps {
	link: LinkResource;
}

export function LinkRow({ link }: Readonly<LinkRowProps>) {
	const instanceUrl = useInstanceUrl();
	const faviconUrl = instanceUrl
		? `${instanceUrl}/favicon?url=${encodeURIComponent(link.url)}`
		: null;

	return (
		<a
			href={link.url}
			target="_blank"
			rel="noreferrer"
			title={link.url}
			className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50"
		>
			{faviconUrl && (
				// Remounts on URL change so a stale `hasFailed` from a
				// previous link (or the pre-hydration empty instanceUrl)
				// never leaks forward and hides a favicon that would load.
				<LinkFavicon key={faviconUrl} faviconUrl={faviconUrl} />
			)}
			<span className="flex-1 truncate">{link.name}</span>
			{link.favorite && (
				<div className="i-ant-design-star-filled h-3.5 w-3.5 flex-shrink-0 text-yellow-500" />
			)}
		</a>
	);
}
