import { toast } from 'sonner';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { Modal, ConfirmModal } from '@minimalstuff/ui';
import type { MouseEvent as ReactMouseEvent } from 'react';

import { LinkFavicon } from './link_favicon';
import type { LinkResource } from '@/lib/api/types';
import { linkSortableId } from '@/lib/dnd/dnd_types';
import { useDeleteLink } from '@/hooks/use_delete_link';
import { useCollections } from '@/hooks/use_collections';
import { useInstanceUrl } from '@/hooks/use_instance_url';
import { useContextMenu } from '@/hooks/use_context_menu';
import { KebabMenu } from '@/components/common/kebab_menu';
import { ContextMenu } from '@/components/common/context_menu';
import { shouldSuppressClick } from '@/lib/dnd/drag_click_guard';
import { EditLinkModal } from '@/components/links/edit_link_modal';
import { KebabMenuItem } from '@/components/common/kebab_menu_item';
import { buildFaviconUrl, buildVisitUrl } from '@/lib/instance_urls';

interface LinkRowProps {
	link: LinkResource;
	collectionId: number;
}

export function LinkRow({ link, collectionId }: Readonly<LinkRowProps>) {
	const instanceUrl = useInstanceUrl();
	const { collections } = useCollections();
	const deleteLink = useDeleteLink();
	const contextMenu = useContextMenu();
	const faviconUrl = instanceUrl
		? buildFaviconUrl(instanceUrl, link.url)
		: null;
	// Falls back to the raw target only until `instanceUrl` hydrates from
	// storage — the redirect is what counts the click.
	const href = instanceUrl ? buildVisitUrl(instanceUrl, link.id) : link.url;
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: linkSortableId(link.id),
		data: { kind: 'link', linkId: link.id, collectionId },
		// Overrides dnd-kit's default `role: 'button'` — wrong on an `<a>` that
		// actually navigates.
		attributes: { role: 'link' },
	});

	const handleClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
		// A real DOM click still fires on mouseup after a whole-card drag —
		// suppressed here so it doesn't also navigate the link.
		if (shouldSuppressClick()) {
			event.preventDefault();
		}
	};

	const handleCopyLink = () => {
		contextMenu.closeMenu();
		void navigator.clipboard
			.writeText(link.url)
			.then(() => toast.success('Link copied'))
			.catch(() => toast.error('Could not copy link'));
	};

	const handleEdit = () => {
		contextMenu.closeMenu();
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
		contextMenu.closeMenu();
		void ConfirmModal.call({
			title: 'Delete link',
			children: `Delete "${link.name}"? This can't be undone.`,
			confirmLabel: 'Delete',
			confirmColor: 'danger',
			onConfirm: () => deleteLink.mutate(link.id),
		});
	};

	return (
		<div
			ref={setNodeRef}
			onContextMenu={contextMenu.handleContextMenu}
			style={{
				transform: CSS.Transform.toString(transform),
				transition,
				opacity: isDragging ? 0.5 : undefined,
			}}
			className="group relative flex items-center rounded-md hover:bg-white/50 dark:hover:bg-gray-800/50"
		>
			<a
				ref={setActivatorNodeRef}
				{...attributes}
				{...listeners}
				href={href}
				target="_blank"
				rel="noreferrer"
				title={link.url}
				onClick={handleClick}
				// Anchors are natively draggable: Chrome's own link drag would race
				// the pointer sensor and drop the gesture.
				draggable={false}
				className="flex min-w-0 flex-1 cursor-grab items-center gap-2 px-2 py-1.5 text-sm text-gray-700 active:cursor-grabbing dark:text-gray-300"
			>
				{faviconUrl &&
					instanceUrl && (
						// Remounts on URL change so a stale `hasFailed` from a
						// previous link (or the pre-hydration empty instanceUrl)
						// never leaks forward and hides a favicon that would load.
						<LinkFavicon
							key={faviconUrl}
							faviconUrl={faviconUrl}
							instanceUrl={instanceUrl}
						/>
					)}
				<span className="flex-1 truncate">{link.name}</span>
				{link.collectionIds.length > 1 && (
					<span
						title={`In ${link.collectionIds.length} collections`}
						className="flex-shrink-0 rounded bg-gray-200 px-1 text-xs text-gray-500 transition-opacity group-hover:opacity-0 group-focus-within:opacity-0 dark:bg-gray-700 dark:text-gray-400"
					>
						{link.collectionIds.length}
					</span>
				)}
				{link.favorite && (
					<div className="i-ant-design-star-filled h-3.5 w-3.5 flex-shrink-0 text-yellow-500 transition-opacity group-hover:opacity-0 group-focus-within:opacity-0" />
				)}
			</a>
			<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center py-1 pl-2 pr-1 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
				<KebabMenu label={`Actions for ${link.name}`}>
					<KebabMenuItem icon="i-octicon-copy-16" onClick={handleCopyLink}>
						Copy link
					</KebabMenuItem>
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
			<ContextMenu
				isVisible={contextMenu.isVisible}
				shouldRender={contextMenu.shouldRender}
				menuPosition={contextMenu.menuPosition}
				menuContentRef={contextMenu.menuContentRef}
				onBackdropClick={contextMenu.closeMenu}
			>
				<KebabMenuItem icon="i-octicon-copy-16" onClick={handleCopyLink}>
					Copy link
				</KebabMenuItem>
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
			</ContextMenu>
		</div>
	);
}
