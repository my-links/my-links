import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';
import { useMemo } from 'react';
import { FormCollectionContent } from '~/components/dashboard/forms/form_collection_content';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { useRouteHelper } from '~/lib/route_helper';
import { Visibility } from '~/types/app';
import { FormCollectionData } from '~/types/collection_form';

interface EditCollectionModalProps {
	onClose: () => void;
}

export function EditCollectionModal({ onClose }: EditCollectionModalProps) {
	const { activeCollection } = useDashboardProps();
	const { data, setData, put, processing, errors } =
		useForm<FormCollectionData>({
			name: activeCollection?.name ?? '',
			description: activeCollection?.description ?? '',
			visibility: activeCollection?.visibility ?? Visibility.PRIVATE,
		});

	const canSubmit = useMemo<boolean>(() => {
		const trimmedName = data.name.trim();
		const trimmedDescription = data.description?.trim();
		const isFormEdited =
			trimmedName !== activeCollection?.name ||
			trimmedDescription !== activeCollection?.description ||
			data.visibility !== activeCollection?.visibility;
		const isFormValid = trimmedName !== '';
		return isFormEdited && isFormValid && !processing;
	}, [data, activeCollection, processing]);

	const { url } = useRouteHelper();

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const editUrl = url('collection.edit', {
			params: { id: activeCollection?.id.toString() ?? '' },
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
				<button
					type="button"
					onClick={onClose}
					className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
				>
					<Trans>Cancel</Trans>
				</button>
				<button
					type="submit"
					disabled={!canSubmit}
					className={clsx(
						'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
						!canSubmit
							? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
							: 'bg-blue-600 hover:bg-blue-700'
					)}
				>
					{processing ? (
						<span className="flex items-center gap-2">
							<span className="i-svg-spinners-3-dots-fade w-4 h-4" />
							<Trans>Update</Trans>
						</span>
					) : (
						<Trans>Update</Trans>
					)}
				</button>
			</div>
		</form>
	);
}
