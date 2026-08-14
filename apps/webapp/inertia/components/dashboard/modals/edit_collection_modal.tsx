import { useId, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { ModalFooter } from '@minimalstuff/ui';

import { urlFor } from '~/lib/tuyau';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { ModalFormFooter } from '~/components/dashboard/modals/modal_form_footer';
import {
	FormCollectionContent,
	type FormCollectionData,
} from '~/components/dashboard/forms/form_collection_content';

interface EditCollectionModalProps {
	onClose: () => void;
	collection?: Data.Collection;
}

export function EditCollectionModal({
	onClose,
	collection,
}: Readonly<EditCollectionModalProps>) {
	const formId = useId();
	const { activeCollection } = useDashboardProps();
	const targetCollection = collection ?? activeCollection;
	const { data, setData, put, processing, errors } =
		useForm<FormCollectionData>({
			name: targetCollection?.name ?? '',
			description: targetCollection?.description ?? '',
			visibility: targetCollection?.visibility ?? 'PRIVATE',
			icon: targetCollection?.icon ?? null,
		});

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

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const editUrl = urlFor('collection.edit', {
			id: targetCollection?.id?.toString() ?? '',
		});
		put(editUrl, {
			onSuccess: () => {
				onClose();
			},
		});
	};

	return (
		<>
			<form id={formId} onSubmit={handleSubmit} className="space-y-4">
				<FormCollectionContent data={data} setData={setData} errors={errors} />
			</form>
			<ModalFooter>
				<ModalFormFooter
					formId={formId}
					onCancel={onClose}
					canSubmit={canSubmit}
					processing={processing}
					submitLabel={<Trans>Update</Trans>}
				/>
			</ModalFooter>
		</>
	);
}
