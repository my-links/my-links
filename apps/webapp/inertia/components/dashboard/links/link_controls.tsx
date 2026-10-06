import type { Data } from '@generated/data';
import { ContextMenu, CopyButton, IconButton } from '@minimalstuff/ui';
import {
	useImperativeHandle,
	useRef,
	type MouseEvent as ReactMouseEvent,
} from 'react';

import { useLinkActions } from '~/hooks/use_link_actions';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { useLinkCollections } from '~/hooks/use_link_collections';
import { dispatchContextMenuAt } from '~/lib/dispatch_context_menu';
import { LinkMenuItems } from '~/components/dashboard/links/link_menu_items';

type Link = Data.Link;

export type LinkControlsRef = {
	openContextMenu: (x: number, y: number) => void;
};

type LinkControlsProps = {
	ref: React.RefObject<LinkControlsRef | null>;
	link: Link;
	/** Notified after a menu item runs its action, so a host like the search modal can close itself. */
	onAction?: () => void;
	/** Notified once the refresh request completes so the favicon image can bust its own cache. */
	onFaviconRefreshed?: () => void;
};

export function LinkControls({
	link,
	ref,
	onAction,
	onFaviconRefreshed,
}: Readonly<LinkControlsProps>) {
	const { activeCollection } = useDashboardProps();
	const { linkCollections } = useLinkCollections(link);
	const actions = useLinkActions(link, onAction, onFaviconRefreshed);

	const isOwner = activeCollection?.isOwner !== false;

	const menuRef = useRef<HTMLDivElement>(null);

	const handleOpenMenu = (event: ReactMouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		event.stopPropagation();
		dispatchContextMenuAt(menuRef.current, event.clientX, event.clientY);
	};

	useImperativeHandle(ref, () => ({
		openContextMenu: (x: number, y: number) => {
			dispatchContextMenuAt(menuRef.current, x, y);
		},
	}));

	return (
		<CopyButton value={link.url}>
			{({ copy }) => {
				const handleCopy = () => {
					void copy();
					onAction?.();
				};

				return (
					<ContextMenu
						ref={menuRef}
						className="relative"
						items={
							<LinkMenuItems
								link={link}
								linkCollections={linkCollections}
								isOwner={isOwner}
								actions={actions}
								onCopy={handleCopy}
							/>
						}
					>
						<IconButton
							icon="i-mdi-dots-vertical"
							onClick={handleOpenMenu}
							aria-label="Menu"
						/>
					</ContextMenu>
				);
			}}
		</CopyButton>
	);
}
