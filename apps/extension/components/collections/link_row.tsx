import { Modal, ConfirmModal } from '@minimalstuff/ui';

import { LinkFavicon } from './link_favicon';
import type { LinkResource } from '@/lib/api/types';
import { useDeleteLink } from '@/hooks/use_delete_link';
import { useCollections } from '@/hooks/use_collections';
import { useInstanceUrl } from '@/hooks/use_instance_url';
import { KebabMenu } from '@/components/common/kebab_menu';
import { EditLinkModal } from '@/components/links/edit_link_modal';
import { KebabMenuItem } from '@/components/common/kebab_menu_item';
import { buildFaviconUrl, buildVisitUrl } from '@/lib/instance_urls';

interface LinkRowProps {
	link: LinkResource;
}

export function LinkRow({ link }: Readonly<LinkRowProps>) {
	const instanceUrl = useInstanceUrl();
	const { collections } = useCollections();
	const deleteLink = useDeleteLink();
	const faviconUrl = instanceUrl
		? buildFaviconUrl(instanceUrl, link.url)
		: null;
	// Falls back to the raw target only until `instanceUrl` hydrates from
	// storage — the redirect is what counts the click.
	const href = instanceUrl ? buildVisitUrl(instanceUrl, link.id) : link.url;

	const handleEdit = () => {
		const call = Modal.call({
			title: 'Edit link',
			children: (
				<EditLinkModal
					link={link}
					collections={collections}
					onClose={() => Modal.end(call, undefined)}
				/>
			),
		});
	};

	const handleDelete = () => {
		void ConfirmModal.call({
			title: 'Delete link',
			children: `Delete "${link.name}"? This can't be undone.`,
			confirmLabel: 'Delete',
			confirmColor: 'red',
			onConfirm: () => deleteLink.mutate(link.id),
		});
	};

	return (
		<div className="group flex items-center gap-0.5 rounded-md hover:bg-white/50 dark:hover:bg-gray-800/50">
			<a
				href={href}
				target="_blank"
				rel="noreferrer"
				title={link.url}
				className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300"
			>
				{faviconUrl && (
					// Remounts on URL change so a stale `hasFailed` from a
					// previous link (or the pre-hydration empty instanceUrl)
					// never leaks forward and hides a favicon that would load.
					<LinkFavicon key={faviconUrl} faviconUrl={faviconUrl} />
				)}
				<span className="flex-1 truncate">{link.name}</span>
				{link.collectionIds.length > 1 && (
					<span
						title={`In ${link.collectionIds.length} collections`}
						className="flex-shrink-0 rounded bg-gray-200 px-1 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400"
					>
						{link.collectionIds.length}
					</span>
				)}
				{link.favorite && (
					<div className="i-ant-design-star-filled h-3.5 w-3.5 flex-shrink-0 text-yellow-500" />
				)}
			</a>
			<div className="flex-shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
				<KebabMenu label={`Actions for ${link.name}`}>
					<KebabMenuItem icon="i-octicon-pencil" onClick={handleEdit}>
						Edit
					</KebabMenuItem>
					<KebabMenuItem
						icon="i-ion-trash-outline"
						onClick={handleDelete}
						isDanger
					>
						Delete
					</KebabMenuItem>
				</KebabMenu>
			</div>
		</div>
	);
}
