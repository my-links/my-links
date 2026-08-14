import { useId, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { ModalFooter } from '@minimalstuff/ui';

import { urlFor } from '~/lib/tuyau';
import { ModalFormFooter } from '~/components/dashboard/modals/modal_form_footer';
import {
	FormCollectionContent,
	type FormCollectionData,
} from '~/components/dashboard/forms/form_collection_content';

interface CreateCollectionModalProps {
	onClose: () => void;
	message?: string;
}

export function CreateCollectionModal({
	onClose,
	message,
}: Readonly<CreateCollectionModalProps>) {
	const formId = useId();
	const { data, setData, submit, processing, errors } =
		useForm<FormCollectionData>({
			name: '',
			description: '',
			visibility: 'PRIVATE',
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
		<>
			<form id={formId} onSubmit={handleSubmit} className="space-y-4">
				{message && (
					<div className="text-sm text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
						{message}
					</div>
				)}
				<FormCollectionContent data={data} setData={setData} errors={errors} />
			</form>
			<ModalFooter>
				<ModalFormFooter
					formId={formId}
					onCancel={onClose}
					canSubmit={!isFormDisabled}
					processing={processing}
					submitLabel={<Trans>Create</Trans>}
				/>
			</ModalFooter>
		</>
	);
}
