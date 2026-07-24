import { Button } from '@minimalstuff/ui';
import { useState, type FormEvent } from 'react';

import { trimToNullableText } from '@/lib/strings';
import { useUpdateLink } from '@/hooks/use_update_link';
import type { CollectionWithLinks, LinkResource } from '@/lib/api/types';
import { LinkFormFields, type LinkFormValues } from './link_form_fields';

interface EditLinkModalProps {
	link: LinkResource;
	collections: CollectionWithLinks[];
	onClose: () => void;
}

export function EditLinkModal({
	link,
	collections,
	onClose,
}: Readonly<EditLinkModalProps>) {
	const updateLink = useUpdateLink();
	const [values, setValues] = useState<LinkFormValues>({
		name: link.name,
		url: link.url,
		description: link.description,
		favorite: link.favorite,
		collectionId: link.collectionId,
	});

	const isFormValid =
		values.name.trim() !== '' &&
		values.url.trim() !== '' &&
		values.collectionId !== undefined;

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (values.collectionId === undefined) {
			return;
		}

		updateLink.mutate(
			{
				linkId: link.id,
				input: {
					name: values.name.trim(),
					url: values.url.trim(),
					description: trimToNullableText(values.description),
					favorite: values.favorite,
					collectionId: values.collectionId,
				},
			},
			{ onSuccess: onClose }
		);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<LinkFormFields
				values={values}
				onChange={setValues}
				collections={collections}
				isDisabled={updateLink.isPending}
			/>
			{updateLink.isError && (
				<p className="text-sm text-red-600 dark:text-red-400">
					Couldn't update the link. Try again.
				</p>
			)}
			<div className="flex justify-end gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
				<Button
					variant="outline"
					color="neutral"
					type="button"
					onClick={onClose}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					loading={updateLink.isPending}
					disabled={!isFormValid}
				>
					Save
				</Button>
			</div>
		</form>
	);
}
