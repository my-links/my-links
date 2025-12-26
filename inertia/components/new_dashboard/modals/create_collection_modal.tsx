import { useForm } from '@inertiajs/react';
import { Trans as TransComponent } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';
import { useMemo } from 'react';
import { FormCollectionData } from '~/components/form/form_collection';
import { FormCollectionContent } from '~/components/new_dashboard/forms/form_collection_content';
import { useRouteHelper } from '~/lib/route_helper';
import { Visibility } from '~/types/app';

interface CreateCollectionModalProps {
	onClose: () => void;
}

export function CreateCollectionModal({ onClose }: CreateCollectionModalProps) {
	const { data, setData, submit, processing, errors } =
		useForm<FormCollectionData>({
			name: '',
			description: '',
			visibility: Visibility.PRIVATE,
		});

	const isFormDisabled = useMemo(
		() => processing || data.name.length === 0,
		[processing, data]
	);

	const { route } = useRouteHelper();

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const { method, url } = route('collection.create');
		submit(method as any, url, {
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
					disabled={isFormDisabled}
					className={clsx(
						'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
						isFormDisabled
							? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
							: 'bg-blue-600 hover:bg-blue-700'
					)}
				>
					{processing ? (
						<span className="flex items-center gap-2">
							<span className="i-svg-spinners-3-dots-fade w-4 h-4" />
							<TransComponent id="common:form.create" message="Create" />
						</span>
					) : (
						<TransComponent id="common:form.create" message="Create" />
					)}
				</button>
			</div>
		</form>
	);
}
