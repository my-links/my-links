import { useId, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { ModalFooter } from '@minimalstuff/ui';

import { urlFor } from '~/lib/tuyau';
import { isValidHttpUrl } from '~/lib/navigation';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { ModalFormFooter } from '~/components/dashboard/modals/modal_form_footer';
import {
	FormLinkContent,
	type FormLinkData,
} from '~/components/dashboard/forms/form_link_content';

interface CreateLinkModalProps {
	onClose: () => void;
	collectionId?: number;
}

export function CreateLinkModal({
	onClose,
	collectionId,
}: Readonly<CreateLinkModalProps>) {
	const formId = useId();
	const { activeCollection, allCollections } = useDashboardProps();
	// Pre-check the requested collection, falling back to the collection
	// being viewed, unless it's the Inbox (the "no collection" fallback) —
	// leaving the boxes empty already lands there.
	const seededCollectionIds = collectionId
		? [collectionId]
		: activeCollection && !activeCollection.isDefault
			? [activeCollection.id]
			: [];
	const { data, setData, submit, processing, errors } = useForm<FormLinkData>({
		name: '',
		description: '',
		url: '',
		favorite: false,
		collectionIds: seededCollectionIds,
	});

	const canSubmit = useMemo<boolean>(
		() =>
			data.name !== '' &&
			isValidHttpUrl(data.url) &&
			data.favorite !== null &&
			!processing,
		[data, processing]
	);

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const createUrl = urlFor('link.create');
		submit('post', createUrl, {
			onSuccess: () => {
				onClose();
			},
		});
	};

	return (
		<>
			<form id={formId} onSubmit={handleSubmit} className="space-y-4">
				<FormLinkContent
					data={data}
					setData={setData}
					errors={errors}
					collections={allCollections}
				/>
			</form>
			<ModalFooter>
				<ModalFormFooter
					formId={formId}
					onCancel={onClose}
					canSubmit={canSubmit}
					processing={processing}
					submitLabel={<Trans>Create</Trans>}
				/>
			</ModalFooter>
		</>
	);
}
