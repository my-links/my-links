import type { ChangeEvent } from 'react';
import { Checkbox, Input, Textarea } from '@minimalstuff/ui';

import type { CollectionWithLinks } from '@/lib/api/types';

export interface LinkFormValues {
	name: string;
	url: string;
	description: string | null;
	favorite: boolean;
	collectionIds: number[];
}

interface LinkFormFieldsProps {
	values: LinkFormValues;
	onChange: (values: LinkFormValues) => void;
	collections: CollectionWithLinks[];
	isDisabled?: boolean;
}

export function LinkFormFields({
	values,
	onChange,
	collections,
	isDisabled = false,
}: Readonly<LinkFormFieldsProps>) {
	const handleNameChange = (event: ChangeEvent<HTMLInputElement>) =>
		onChange({ ...values, name: event.target.value });

	const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) =>
		onChange({ ...values, url: event.target.value });

	const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
		onChange({ ...values, description: event.target.value });

	const toggleCollection = (collectionId: number) =>
		onChange({
			...values,
			collectionIds: values.collectionIds.includes(collectionId)
				? values.collectionIds.filter((id) => id !== collectionId)
				: [...values.collectionIds, collectionId],
		});

	const handleFavoriteChange = (event: ChangeEvent<HTMLInputElement>) =>
		onChange({ ...values, favorite: event.target.checked });

	// The default (Inbox) collection is the implicit home for links with no
	// collection selected, so it's never offered as an explicit choice here.
	const selectableCollections = collections.filter(
		(collection) => !collection.isDefault
	);

	return (
		<div className="space-y-3">
			<Input
				label="Name"
				placeholder="Name"
				value={values.name}
				onChange={handleNameChange}
				disabled={isDisabled}
				autoFocus
				required
			/>
			<Input
				label="URL"
				type="url"
				placeholder="URL"
				value={values.url}
				onChange={handleUrlChange}
				disabled={isDisabled}
				required
			/>
			<Textarea
				label="Description"
				placeholder="Description"
				value={values.description ?? ''}
				onChange={handleDescriptionChange}
				disabled={isDisabled}
				rows={2}
			/>
			{selectableCollections.length > 0 && (
				<fieldset className="space-y-1">
					<legend className="text-sm mb-1">
						Collections ({selectableCollections.length})
					</legend>
					{selectableCollections.map((collection) => (
						<Checkbox
							key={collection.id}
							label={collection.name}
							checked={values.collectionIds.includes(collection.id)}
							onChange={() => toggleCollection(collection.id)}
							disabled={isDisabled}
						/>
					))}
					{values.collectionIds.length === 0 && (
						<p className="text-xs text-gray-500 dark:text-gray-400">
							No collection selected — this link goes to your Inbox.
						</p>
					)}
				</fieldset>
			)}
			<Checkbox
				label="Favorite"
				checked={values.favorite}
				onChange={handleFavoriteChange}
				disabled={isDisabled}
			/>
		</div>
	);
}
