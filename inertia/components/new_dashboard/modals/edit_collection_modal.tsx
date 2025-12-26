import { Collection } from '#shared/types/dto';
import { useForm } from '@inertiajs/react';
import { Trans as TransComponent } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';
import { useMemo } from 'react';
import { FormCollectionData } from '~/components/form/form_collection';
import { FormCollectionContent } from '~/components/new_dashboard/forms/form_collection_content';
import { useRouteHelper } from '~/lib/route_helper';

interface EditCollectionModalProps {
	collection: Collection;
	onClose: () => void;
}

export function EditCollectionModal({
	collection,
	onClose,
}: EditCollectionModalProps) {
	const { data, setData, submit, processing, errors } =
		useForm<FormCollectionData>({
			name: collection.name,
			description: collection.description,
			visibility: collection.visibility,
		});

	const canSubmit = useMemo<boolean>(() => {
		const trimmedName = data.name.trim();
		const trimmedDescription = data.description?.trim();
		const isFormEdited =
			trimmedName !== collection.name ||
			trimmedDescription !== collection.description ||
			data.visibility !== collection.visibility;
		const isFormValid = trimmedName !== '';
		return isFormEdited && isFormValid && !processing;
	}, [data, collection, processing]);

	const { route } = useRouteHelper();

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const { method, url } = route('collection.edit', {
			params: {
				id: collection.id.toString(),
			},
		});
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
							<TransComponent id="common:form.update" message="Update" />
						</span>
					) : (
						<TransComponent id="common:form.update" message="Update" />
					)}
				</button>
			</div>
		</form>
	);
}
