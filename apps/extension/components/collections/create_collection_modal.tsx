import { Button } from '@minimalstuff/ui';
import { useState, type FormEvent } from 'react';

import { trimToNullableText } from '@/lib/strings';
import { useCreateCollection } from '@/hooks/use_create_collection';
import {
	CollectionFormFields,
	type CollectionFormValues,
} from './collection_form_fields';

interface CreateCollectionModalProps {
	onClose: () => void;
}

export function CreateCollectionModal({
	onClose,
}: Readonly<CreateCollectionModalProps>) {
	const createCollection = useCreateCollection();
	const [values, setValues] = useState<CollectionFormValues>({
		name: '',
		description: null,
		visibility: 'PRIVATE',
		icon: null,
	});

	const isFormValid = values.name.trim() !== '';

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		createCollection.mutate(
			{
				name: values.name.trim(),
				description: trimToNullableText(values.description),
				visibility: values.visibility,
				icon: trimToNullableText(values.icon),
			},
			{ onSuccess: onClose }
		);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<CollectionFormFields
				values={values}
				onChange={setValues}
				isDisabled={createCollection.isPending}
			/>
			{createCollection.isError && (
				<p className="text-sm text-red-600 dark:text-red-400">
					Couldn't create the collection. Try again.
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
					loading={createCollection.isPending}
					disabled={!isFormValid}
				>
					Create
				</Button>
			</div>
		</form>
	);
}
