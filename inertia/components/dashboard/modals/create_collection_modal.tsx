import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Button } from '@minimalstuff/ui';
import { useMemo } from 'react';
import { FormCollectionContent } from '~/components/dashboard/forms/form_collection_content';
import { urlFor } from '~/lib/tuyau';
import { Visibility } from '~/types/app';
import { FormCollectionData } from '~/types/collection_form';

interface CreateCollectionModalProps {
	onClose: () => void;
	message?: string;
}

export function CreateCollectionModal({
	onClose,
	message,
}: Readonly<CreateCollectionModalProps>) {
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

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const createUrl = urlFor('collection.create');
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
				<Button type="submit" disabled={isFormDisabled}>
					{processing && (
						<span
							className="i-svg-spinners-3-dots-fade w-4 h-4"
							aria-hidden="true"
						/>
					)}
					<Trans>Create</Trans>
				</Button>
			</div>
		</form>
	);
}
