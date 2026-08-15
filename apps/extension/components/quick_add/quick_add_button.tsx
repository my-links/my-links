import { IconButton, Modal, Tooltip } from '@minimalstuff/ui';

import { useActiveTab } from '@/hooks/use_active_tab';
import { findLinkByUrl } from '@/lib/collections_tree';
import { useCollections } from '@/hooks/use_collections';
import { EditLinkModal } from '@/components/links/edit_link_modal';
import { CreateLinkModal } from '@/components/links/create_link_modal';

export function QuickAddButton() {
	const activeTab = useActiveTab();
	const { collections } = useCollections();

	const handleClick = () => {
		if (!activeTab) {
			return;
		}

		const existingLink = findLinkByUrl(collections, activeTab.url);
		const call = Modal.call({
			title: existingLink ? 'Already in MyLinks' : 'Add to MyLinks',
			children: existingLink ? (
				<EditLinkModal
					link={existingLink}
					collections={collections}
					onClose={() => Modal.end(call, undefined)}
				/>
			) : (
				<CreateLinkModal
					collections={collections}
					initialValues={{ name: activeTab.title, url: activeTab.url }}
					onClose={() => Modal.end(call, undefined)}
				/>
			),
		});
	};

	return (
		<Tooltip content="Add current tab to MyLinks" position="bottom">
			<IconButton
				icon="i-ion-bookmark"
				aria-label="Add current tab to MyLinks"
				size="sm"
				variant="ghost"
				onClick={handleClick}
				disabled={!activeTab}
			/>
		</Tooltip>
	);
}
