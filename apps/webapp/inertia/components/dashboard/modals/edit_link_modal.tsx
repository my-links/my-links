import { useMemo } from 'react';
import { Button } from '@minimalstuff/ui';
import { useForm } from '@inertiajs/react';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';

import { urlFor } from '~/lib/tuyau';
import { isValidHttpUrl } from '~/lib/navigation';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import {
	FormLinkContent,
	type FormLinkData,
} from '~/components/dashboard/forms/form_link_content';

interface EditLinkModalProps {
	link: Data.Link.Variants['withCollections'];
	onClose: () => void;
}

function sameMembers(left: number[], right: number[]): boolean {
	if (left.length !== right.length) return false;
	const rightSet = new Set(right);
	return left.every((id) => rightSet.has(id));
}

export function EditLinkModal({ link, onClose }: Readonly<EditLinkModalProps>) {
	const { allCollections } = useDashboardProps();
	// The Inbox membership is the "no collection" fallback, not an explicit
	// choice — strip it so an Inbox-only link opens with nothing checked (and
	// the "goes to your Inbox" hint), and clearing every box lands it back there.
	const inboxCollectionId = allCollections.find(
		(collection) => collection.isDefault
	)?.id;
	const initialCollectionIds = useMemo(
		() => link.collectionIds.filter((id) => id !== inboxCollectionId),
		[link.collectionIds, inboxCollectionId]
	);
	const { data, setData, submit, processing, errors } = useForm<FormLinkData>({
		name: link.name,
		description: link.description,
		url: link.url,
		favorite: link.favorite,
		collectionIds: initialCollectionIds,
	});

	const canSubmit = useMemo<boolean>(() => {
		const trimmedName = data.name.trim();
		const trimmedDescription = data.description?.trim();
		const trimmedUrl = data.url.trim();

		const isFormEdited =
			trimmedName !== link.name ||
			trimmedUrl !== link.url ||
			trimmedDescription !== link.description ||
			data.favorite !== link.favorite ||
			!sameMembers(data.collectionIds, initialCollectionIds);

		const isFormValid =
			trimmedName !== '' &&
			isValidHttpUrl(trimmedUrl) &&
			data.favorite !== null;

		return isFormEdited && isFormValid && !processing;
	}, [data, link, initialCollectionIds, processing]);

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const editUrl = urlFor('link.edit', {
			id: link.id.toString(),
		});
		submit('put', editUrl, {
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
					<Trans>Update</Trans>
				</Button>
			</div>
		</form>
	);
}
