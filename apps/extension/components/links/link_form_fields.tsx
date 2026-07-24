import type { ChangeEvent } from 'react';
import { Checkbox, Input, Select, Textarea } from '@minimalstuff/ui';

import type { CollectionWithLinks } from '@/lib/api/types';

export interface LinkFormValues {
	name: string;
	url: string;
	description: string | null;
	favorite: boolean;
	collectionId: number | undefined;
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

	const handleCollectionChange = (event: ChangeEvent<HTMLSelectElement>) =>
		onChange({ ...values, collectionId: Number(event.target.value) });

	const handleFavoriteChange = (event: ChangeEvent<HTMLInputElement>) =>
		onChange({ ...values, favorite: event.target.checked });

	const collectionOptions = collections.map((collection) => ({
		value: String(collection.id),
		label: collection.name,
	}));

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
			{collectionOptions.length > 0 && (
				<Select
					label={`Collections (${collectionOptions.length})`}
					options={collectionOptions}
					value={values.collectionId ? String(values.collectionId) : ''}
					onChange={handleCollectionChange}
					disabled={isDisabled}
				/>
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
