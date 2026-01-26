import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { useMemo } from 'react';
import { Button } from '~/components/common/button';
import { FormCollectionContent } from '~/components/dashboard/forms/form_collection_content';
import { useRouteHelper } from '~/lib/route_helper';
import { Visibility } from '~/types/app';
import { FormCollectionData } from '~/types/collection_form';

interface CreateCollectionModalProps {
	onClose: () => void;
	message?: string;
}

export function CreateCollectionModal({
	onClose,
	message,
}: CreateCollectionModalProps) {
	const { data, setData, submit, processing, errors } =
		useForm<FormCollectionData>({
			name: '',
			description: '',
			visibility: Visibility.PRIVATE,
			icon: null,
		});

	const isFormDisabled = useMemo(
		() => processing || data.name.length === 0,
		[processing, data]
	);

	const { url: getUrl } = useRouteHelper();

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const createUrl = getUrl('collection.create');
		submit('post', createUrl, {
			onSuccess: () => {
				onClose();
			},
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{message && (
				<div className="text-sm text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
					{message}
				</div>
			)}
			<FormCollectionContent data={data} setData={setData} errors={errors} />

			<div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
				<Button variant="secondary" type="button" onClick={onClose}>
					<Trans>Cancel</Trans>
				</Button>
				<Button type="submit" loading={processing} disabled={isFormDisabled}>
					<Trans>Create</Trans>
				</Button>
			</div>
		</form>
	);
}
