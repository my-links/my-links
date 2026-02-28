import type { Data } from '@generated/data';
import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Button } from '@minimalstuff/ui';
import { FormCollectionContent } from '~/components/dashboard/forms/form_collection_content';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { urlFor } from '~/lib/tuyau';
import { Visibility } from '~/types/app';
import { FormCollectionData } from '~/types/collection_form';

interface DeleteCollectionModalProps {
	onClose: () => void;
	collection?: Data.Collection;
}

export function DeleteCollectionModal({
	onClose,
	collection,
}: Readonly<DeleteCollectionModalProps>) {
	const { activeCollection } = useDashboardProps();
	const targetCollection = collection ?? activeCollection;
	const { data, setData, submit, processing, errors } =
		useForm<FormCollectionData>({
			icon: targetCollection?.icon ?? null,
			name: targetCollection?.name ?? '',
			description: targetCollection?.description ?? '',
			visibility: targetCollection?.visibility ?? Visibility.PRIVATE,
		});

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const deleteUrl = urlFor('collection.delete', {
			id: targetCollection?.id.toString() ?? '',
		});
		submit('delete', deleteUrl, {
			onSuccess: () => {
				onClose();
			},
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<p className="text-sm text-red-600 dark:text-red-400">
				<Trans>Are you sure you want to delete this collection?</Trans>
			</p>

			<FormCollectionContent
				data={data}
				setData={setData}
				errors={errors}
				disableInputs
			/>

			<div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
				<Button variant="secondary" type="button" onClick={onClose}>
					<Trans>Cancel</Trans>
				</Button>
				<Button variant="danger" type="submit" disabled={processing}>
					{processing && (
						<span
							className="i-svg-spinners-3-dots-fade w-4 h-4"
							aria-hidden="true"
						/>
					)}
					<Trans>Delete</Trans>
				</Button>
			</div>
		</form>
	);
}
