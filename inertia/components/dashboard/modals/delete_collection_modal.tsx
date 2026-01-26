import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Button } from '~/components/common/button';
import { FormCollectionContent } from '~/components/dashboard/forms/form_collection_content';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { useRouteHelper } from '~/lib/route_helper';
import { Visibility } from '~/types/app';
import { FormCollectionData } from '~/types/collection_form';

interface DeleteCollectionModalProps {
	onClose: () => void;
}

export function DeleteCollectionModal({ onClose }: DeleteCollectionModalProps) {
	const { activeCollection } = useDashboardProps();
	const { data, setData, submit, processing, errors } =
		useForm<FormCollectionData>({
			name: activeCollection?.name ?? '',
			description: activeCollection?.description ?? '',
			visibility: activeCollection?.visibility ?? Visibility.PRIVATE,
		});

	const { url: getUrl } = useRouteHelper();

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const deleteUrl = getUrl('collection.delete', {
			params: { id: activeCollection?.id.toString() ?? '' },
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
				<Button
					variant="danger"
					type="submit"
					loading={processing}
					disabled={processing}
				>
					<Trans>Delete</Trans>
				</Button>
			</div>
		</form>
	);
}
