import type { Data } from '@generated/data';
import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Button } from '@minimalstuff/ui';
import { useMemo } from 'react';
import { FormCollectionContent } from '~/components/dashboard/forms/form_collection_content';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { urlFor } from '~/lib/tuyau';
import { Visibility } from '~/types/app';
import { FormCollectionData } from '~/types/collection_form';

interface EditCollectionModalProps {
	onClose: () => void;
	collection?: Data.Collection;
}

export function EditCollectionModal({
	onClose,
	collection,
}: Readonly<EditCollectionModalProps>) {
	const { activeCollection } = useDashboardProps();
	const targetCollection = collection ?? activeCollection;
	const { data, setData, put, processing, errors } =
		useForm<FormCollectionData>({
			name: targetCollection?.name ?? '',
			description: targetCollection?.description ?? '',
			visibility: targetCollection?.visibility ?? Visibility.PRIVATE,
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
		<form onSubmit={handleSubmit} className="space-y-4">
			<FormCollectionContent data={data} setData={setData} errors={errors} />

			<div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
				<Button variant="secondary" type="button" onClick={onClose}>
					<Trans>Cancel</Trans>
				</Button>
				<Button type="submit" disabled={!canSubmit}>
					{processing && (
						<span
							className="i-svg-spinners-3-dots-fade w-4 h-4"
							aria-hidden="true"
						/>
					)}
					<Trans>Update</Trans>
				</Button>
			</div>
		</form>
	);
}
