import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
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
				<button
					type="button"
					onClick={onClose}
					className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
				>
					<Trans>Cancel</Trans>
				</button>
				<button
					type="submit"
					disabled={processing}
					className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
						processing
							? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
							: 'bg-red-600 hover:bg-red-700'
					}`}
				>
					{processing ? (
						<span className="flex items-center gap-2">
							<span className="i-svg-spinners-3-dots-fade w-4 h-4" />
							<Trans>Delete</Trans>
						</span>
					) : (
						<Trans>Delete</Trans>
					)}
				</button>
			</div>
		</form>
	);
}
