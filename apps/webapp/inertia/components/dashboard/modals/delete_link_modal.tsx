import type { Data } from '@generated/data';
import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { ModalFooter } from '@minimalstuff/ui';
import { useId } from 'react';

import {
	FormLinkContent,
	type FormLinkData,
} from '~/components/dashboard/forms/form_link_content';
import { ModalFormFooter } from '~/components/dashboard/modals/modal_form_footer';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { urlFor } from '~/lib/tuyau';

type DeleteLinkModalProps = {
	link: Data.Link.Variants['withCollections'];
	onClose: () => void;
};

export function DeleteLinkModal({
	link,
	onClose,
}: Readonly<DeleteLinkModalProps>) {
	const formId = useId();
	const { allCollections } = useDashboardProps();
	const linkCollections = allCollections.filter((collection) =>
		link.collectionIds.includes(collection.id)
	);
	const { data, setData, submit, processing, errors } = useForm<FormLinkData>({
		name: link.name,
		description: link.description,
		url: link.url,
		favorite: link.favorite,
		collectionIds: link.collectionIds,
	});

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const deleteUrl = urlFor('link.delete', {
			id: link.id.toString(),
		});
		submit('delete', deleteUrl, {
			onSuccess: () => {
				onClose();
			},
		});
	};

	return (
		<>
			<form id={formId} onSubmit={handleSubmit} className="space-y-4">
				<p className="text-sm text-red-600 dark:text-red-400">
					<Trans>Are you sure you want to delete this link?</Trans>
				</p>

				<FormLinkContent
					data={data}
					setData={setData}
					errors={errors}
					collections={linkCollections}
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
