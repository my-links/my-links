import { LinkFavicon } from './link_favicon';
import { useInstanceUrl } from '@/hooks/use_instance_url';
import type { FollowedLinkResource } from '@/lib/api/types';
import { buildFaviconUrl, buildVisitUrl } from '@/lib/instance_urls';

interface FollowedLinkRowProps {
	link: FollowedLinkResource;
}

/**
 * Read-only counterpart to `LinkRow` — a followed link can be opened, never
 * edited or deleted, so there is no kebab menu, no context menu, and no
 * `collectionIds` badge (the API never sends that field for a followed
 * collection's links, see `lib/api/types.ts`).
 */
export function FollowedLinkRow({ link }: Readonly<FollowedLinkRowProps>) {
	const instanceUrl = useInstanceUrl();
	const faviconUrl = instanceUrl
		? buildFaviconUrl(instanceUrl, link.url)
		: null;
	// Falls back to the raw target only until `instanceUrl` hydrates from
	// storage — the redirect is what counts the click.
	const href = instanceUrl ? buildVisitUrl(instanceUrl, link.id) : link.url;

	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			title={link.url}
			className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-800/50"
		>
			{faviconUrl &&
				instanceUrl && (
					// Remounts on URL change, same reasoning as `LinkRow`.
					<LinkFavicon
						key={faviconUrl}
						faviconUrl={faviconUrl}
						instanceUrl={instanceUrl}
					/>
				)}
			<span className="flex-1 truncate">{link.name}</span>
			{link.favorite && (
				<div className="i-ant-design-star-filled h-3.5 w-3.5 flex-shrink-0 text-yellow-500" />
			)}
		</a>
	);
}
