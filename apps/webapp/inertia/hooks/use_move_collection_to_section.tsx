import { t } from '@lingui/core/macro';
import { Modal } from '@minimalstuff/ui';
import { router } from '@inertiajs/react';
import type { Data } from '@generated/data';

import { urlFor } from '~/lib/tuyau';
import {
	COLLECTION_SECTION,
	type CollectionSection,
} from '~/lib/dnd/dnd_types';
import { ConfirmVisibilityChangeModal } from '~/components/dashboard/modals/confirm_visibility_change_modal';
import {
	planSectionMove,
	type SectionMovePlan,
	type SectionMovePlacement,
	sectionToVisibility,
} from '~/lib/collection_section_move';
import {
	VISIBILITY_CHANGE_CONFIRMATION,
	getVisibilityChangeConfirmation,
	type VisibilityChangeConfirmation,
} from '~/lib/collection_visibility_change';

type CollectionWithLinks = Data.Collection.Variants['withLinks'];

type OwnedSectionState = {
	collections: CollectionWithLinks[];
	replaceCollections: (next: CollectionWithLinks[]) => () => void;
};

type OwnedSections = {
	publicSection: OwnedSectionState;
	privateSection: OwnedSectionState;
};

export type MoveCollectionToSection = (
	movedId: number,
	fromSection: CollectionSection,
	toSection: CollectionSection,
	anchorId: number | null,
	placement: SectionMovePlacement
) => void;

export function useMoveCollectionToSection({
	publicSection,
	privateSection,
}: OwnedSections): MoveCollectionToSection {
	const sectionState = (section: CollectionSection) =>
		section === COLLECTION_SECTION.PUBLIC ? publicSection : privateSection;

	const confirmThenMove = (
		collection: CollectionWithLinks,
		confirmation: VisibilityChangeConfirmation,
		commit: () => void
	) => {
		const handleClose = () => Modal.end(call, undefined);
		const handleConfirm = () => {
			handleClose();
			commit();
		};
		const call = Modal.call({
			title:
				confirmation === VISIBILITY_CHANGE_CONFIRMATION.EXPOSURE
					? t`Make this collection public`
					: t`Make this collection private`,
			children: (
				<ConfirmVisibilityChangeModal
					confirmation={confirmation}
					collection={collection}
					linksCount={collection.linksCount}
					onConfirm={handleConfirm}
					onClose={handleClose}
				/>
			),
		});
	};

	const commitMove = (
		source: OwnedSectionState,
		target: OwnedSectionState,
		plan: SectionMovePlan
	) => {
		const rollbackSource = source.replaceCollections(plan.nextSource);
		const rollbackTarget = target.replaceCollections(plan.nextTarget);
		router.put(
			urlFor('collection.move-section', { id: plan.moved.id }),
			{
				visibility: plan.moved.visibility,
				collectionIds: plan.nextTarget.map((collection) => collection.id),
			},
			{
				preserveScroll: true,
				preserveState: true,
				onError: () => {
					rollbackSource();
					rollbackTarget();
				},
			}
		);
	};

	return (movedId, fromSection, toSection, anchorId, placement) => {
		const source = sectionState(fromSection);
		const target = sectionState(toSection);
		const plan = planSectionMove({
			source: source.collections,
			target: target.collections,
			movedId,
			anchorId,
			placement,
			targetVisibility: sectionToVisibility(toSection),
		});
		if (!plan) return;

		const confirmation = getVisibilityChangeConfirmation(
			plan.original,
			plan.moved.visibility
		);
		const commit = () => commitMove(source, target, plan);
		if (confirmation === VISIBILITY_CHANGE_CONFIRMATION.NONE) {
			commit();
			return;
		}
		confirmThenMove(plan.original, confirmation, commit);
	};
}
