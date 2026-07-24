import { Button } from '@minimalstuff/ui';
import { useState, type FormEvent } from 'react';

import { trimToNullableText } from '@/lib/strings';
import type { CollectionWithLinks } from '@/lib/api/types';
import { useUpdateCollection } from '@/hooks/use_update_collection';
import {
	CollectionFormFields,
	type CollectionFormValues,
} from './collection_form_fields';

interface EditCollectionModalProps {
	collection: CollectionWithLinks;
	onClose: () => void;
}

export function EditCollectionModal({
	collection,
	onClose,
}: Readonly<EditCollectionModalProps>) {
	const updateCollection = useUpdateCollection();
	const [values, setValues] = useState<CollectionFormValues>({
		name: collection.name,
		description: collection.description,
		visibility: collection.visibility,
		icon: collection.icon,
	});

	const isFormValid = values.name.trim() !== '';

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		updateCollection.mutate(
			{
				collectionId: collection.id,
				input: {
					name: values.name.trim(),
					description: trimToNullableText(values.description),
					visibility: values.visibility,
					icon: trimToNullableText(values.icon),
				},
			},
			{ onSuccess: onClose }
		);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<CollectionFormFields
				values={values}
				onChange={setValues}
				isDisabled={updateCollection.isPending}
			/>
			{updateCollection.isError && (
				<p className="text-sm text-red-600 dark:text-red-400">
					Couldn't update the collection. Try again.
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
					loading={updateCollection.isPending}
					disabled={!isFormValid}
				>
					Save
				</Button>
			</div>
		</form>
	);
}
