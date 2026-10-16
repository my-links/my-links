import { useForm } from '@inertiajs/react';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { ModalFooter } from '@minimalstuff/ui';
import { useId, useMemo, useState } from 'react';

import { urlFor } from '~/lib/tuyau';
import { useTargetCollection } from '~/hooks/use_target_collection';
import { ModalFormFooter } from '~/components/dashboard/modals/modal_form_footer';
import {
	VISIBILITY_CHANGE_CONFIRMATION,
	getVisibilityChangeConfirmation,
} from '~/lib/collection_visibility_change';
import {
	FormCollectionContent,
	type FormCollectionData,
} from '~/components/dashboard/forms/form_collection_content';
import {
	VisibilityChangeConfirmation,
	visibilityChangeSubmitLabel,
} from '~/components/dashboard/modals/visibility_change_confirmation';

type EditCollectionModalProps = {
	onClose: () => void;
	collection?: Data.Collection;
};

export function EditCollectionModal({
	onClose,
	collection,
}: Readonly<EditCollectionModalProps>) {
	const formId = useId();
	const [isConfirmingVisibilityChange, setIsConfirmingVisibilityChange] =
		useState(false);
	const { targetCollection, linksCount } = useTargetCollection(collection);
	const { data, setData, put, processing, errors } =
		useForm<FormCollectionData>({
			name: targetCollection?.name ?? '',
			description: targetCollection?.description ?? '',
			visibility: targetCollection?.visibility ?? 'PRIVATE',
			icon: targetCollection?.icon ?? null,
		});

	const requiredConfirmation = targetCollection
		? getVisibilityChangeConfirmation(targetCollection, data.visibility)
		: VISIBILITY_CHANGE_CONFIRMATION.NONE;
	const needsConfirmation =
		requiredConfirmation !== VISIBILITY_CHANGE_CONFIRMATION.NONE;

	const canSubmit = useMemo<boolean>(() => {
		const trimmedName = data.name.trim();
		const trimmedDescription = data.description?.trim();
		const isFormEdited =
			trimmedName !== targetCollection?.name ||
			trimmedDescription !== targetCollection?.description ||
			data.visibility !== targetCollection?.visibility ||
			data.icon !== (targetCollection?.icon ?? null);
		const isFormValid = trimmedName !== '';
		return isFormEdited && isFormValid && !processing;
	}, [data, targetCollection, processing]);

	const handleBackToForm = () => setIsConfirmingVisibilityChange(false);

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (needsConfirmation && !isConfirmingVisibilityChange) {
			setIsConfirmingVisibilityChange(true);
			return;
		}
		const editUrl = urlFor('collection.edit', {
			id: targetCollection?.id?.toString() ?? '',
		});
		put(editUrl, {
			onSuccess: () => {
				onClose();
			},
		});
	};

	const formContent =
		isConfirmingVisibilityChange && targetCollection ? (
			<VisibilityChangeConfirmation
				confirmation={requiredConfirmation}
				collection={targetCollection}
				linksCount={linksCount}
			/>
		) : (
			<FormCollectionContent data={data} setData={setData} errors={errors} />
		);

	return (
		<>
			<form id={formId} onSubmit={handleSubmit} className="space-y-4">
				{formContent}
			</form>
			<ModalFooter>
				<ModalFormFooter
					formId={formId}
					onCancel={isConfirmingVisibilityChange ? handleBackToForm : onClose}
					cancelLabel={
						isConfirmingVisibilityChange ? <Trans>Back</Trans> : undefined
					}
					canSubmit={canSubmit}
					processing={processing}
					submitLabel={
						isConfirmingVisibilityChange ? (
							visibilityChangeSubmitLabel(requiredConfirmation)
						) : (
							<Trans>Update</Trans>
						)
					}
				/>
			</ModalFooter>
		</>
	);
}
