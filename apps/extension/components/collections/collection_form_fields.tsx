import type { ChangeEvent } from 'react';
import { Input, RadioOptions, Textarea } from '@minimalstuff/ui';

import type { CollectionVisibility } from '@/lib/api/types';

export interface CollectionFormValues {
	name: string;
	description: string | null;
	visibility: CollectionVisibility;
	icon: string | null;
}

const VISIBILITY_OPTIONS = [
	{ value: 'PRIVATE', label: 'Private', description: 'Visible only by you' },
	{ value: 'PUBLIC', label: 'Public', description: 'Visible to everyone' },
];

interface CollectionFormFieldsProps {
	values: CollectionFormValues;
	onChange: (values: CollectionFormValues) => void;
	isDisabled?: boolean;
}

export function CollectionFormFields({
	values,
	onChange,
	isDisabled = false,
}: Readonly<CollectionFormFieldsProps>) {
	const handleNameChange = (event: ChangeEvent<HTMLInputElement>) =>
		onChange({ ...values, name: event.target.value });

	const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
		onChange({ ...values, description: event.target.value });

	const handleIconChange = (event: ChangeEvent<HTMLInputElement>) =>
		onChange({ ...values, icon: event.target.value });

	const handleVisibilityChange = (value: string) =>
		onChange({ ...values, visibility: value as CollectionVisibility });

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
			<Textarea
				label="Description"
				placeholder="Description"
				value={values.description ?? ''}
				onChange={handleDescriptionChange}
				disabled={isDisabled}
				rows={2}
			/>
			<Input
				label="Icon"
				placeholder="📚"
				value={values.icon ?? ''}
				onChange={handleIconChange}
				disabled={isDisabled}
				maxLength={10}
			/>
			<RadioOptions
				label="Visibility"
				options={VISIBILITY_OPTIONS}
				value={values.visibility}
				onChange={handleVisibilityChange}
				orientation="horizontal"
				disabled={isDisabled}
			/>
		</div>
	);
}
