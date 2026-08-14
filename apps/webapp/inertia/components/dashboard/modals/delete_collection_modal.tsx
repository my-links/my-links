import { useId } from 'react';
import { useForm } from '@inertiajs/react';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { plural, t } from '@lingui/core/macro';
import { ModalFooter } from '@minimalstuff/ui';

import { urlFor } from '~/lib/tuyau';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { ModalFormFooter } from '~/components/dashboard/modals/modal_form_footer';
import {
	FormCollectionContent,
	type FormCollectionData,
} from '~/components/dashboard/forms/form_collection_content';

interface DeleteCollectionModalProps {
	onClose: () => void;
	collection?: Data.Collection;
}

export function DeleteCollectionModal({
	onClose,
	collection,
}: Readonly<DeleteCollectionModalProps>) {
	const formId = useId();
	const { activeCollection } = useDashboardProps();
	const targetCollection = collection ?? activeCollection;
	const linksCount = collection
		? collection.linksCount
		: activeCollection?.links?.length;
	const { data, setData, submit, processing, errors } =
		useForm<FormCollectionData>({
			icon: targetCollection?.icon ?? null,
			name: targetCollection?.name ?? '',
			description: targetCollection?.description ?? '',
			visibility: targetCollection?.visibility ?? 'PRIVATE',
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

	const confirmationMessage =
		typeof linksCount === 'number' && linksCount > 0 ? (
			t`Are you sure you want to delete this collection and ${plural(linksCount, { one: 'its # link', other: 'its # links' })}?`
		) : (
			<Trans>Are you sure you want to delete this collection?</Trans>
		);

	return (
		<>
			<form id={formId} onSubmit={handleSubmit} className="space-y-4">
				<p className="text-sm text-red-600 dark:text-red-400">
					{confirmationMessage}
				</p>

				<FormCollectionContent
					data={data}
					setData={setData}
					errors={errors}
					disableInputs
				/>
			</form>
			<ModalFooter>
				<ModalFormFooter
					formId={formId}
					onCancel={onClose}
					canSubmit={!processing}
					processing={processing}
					submitLabel={<Trans>Delete</Trans>}
					submitColor="danger"
				/>
			</ModalFooter>
		</>
	);
}
