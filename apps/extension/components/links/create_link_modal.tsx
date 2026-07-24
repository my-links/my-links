import { Button } from '@minimalstuff/ui';
import { useState, type FormEvent } from 'react';

import { trimToNullableText } from '@/lib/strings';
import { useCreateLink } from '@/hooks/use_create_link';
import type { CollectionWithLinks } from '@/lib/api/types';
import { LinkFormFields, type LinkFormValues } from './link_form_fields';

interface CreateLinkModalProps {
	collections: CollectionWithLinks[];
	initialValues?: Partial<LinkFormValues>;
	onClose: () => void;
}

export function CreateLinkModal({
	collections,
	initialValues,
	onClose,
}: Readonly<CreateLinkModalProps>) {
	const createLink = useCreateLink();
	// The Inbox membership is the "no collection" fallback, not an explicit
	// choice, so it's stripped from any seed — an empty set lands there anyway.
	const inboxCollectionId = collections.find(
		(collection) => collection.isDefault
	)?.id;
	const [values, setValues] = useState<LinkFormValues>({
		name: '',
		url: '',
		description: null,
		favorite: false,
		...initialValues,
		collectionIds: (initialValues?.collectionIds ?? []).filter(
			(id) => id !== inboxCollectionId
		),
	});

	const isFormValid = values.name.trim() !== '' && values.url.trim() !== '';

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		createLink.mutate(
			{
				name: values.name.trim(),
				url: values.url.trim(),
				description: trimToNullableText(values.description),
				favorite: values.favorite,
				collectionIds: values.collectionIds,
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
				isDisabled={createLink.isPending}
			/>
			{createLink.isError && (
				<p className="text-sm text-red-600 dark:text-red-400">
					Couldn't create the link. Try again.
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
					loading={createLink.isPending}
					disabled={!isFormValid}
				>
					Create
				</Button>
			</div>
		</form>
	);
}
