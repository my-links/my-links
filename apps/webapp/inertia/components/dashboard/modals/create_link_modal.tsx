import { useMemo } from 'react';
import { Button } from '@minimalstuff/ui';
import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';

import { urlFor } from '~/lib/tuyau';
import { isValidHttpUrl } from '~/lib/navigation';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
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
		<form onSubmit={handleSubmit} className="space-y-4">
			<FormLinkContent
				data={data}
				setData={setData}
				errors={errors}
				collections={allCollections}
			/>

			<div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
				<Button
					variant="outline"
					color="neutral"
					type="button"
					onClick={onClose}
				>
					<Trans>Cancel</Trans>
				</Button>
				<Button type="submit" disabled={!canSubmit}>
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
