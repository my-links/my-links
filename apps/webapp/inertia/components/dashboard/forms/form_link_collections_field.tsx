import { t } from '@lingui/core/macro';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { useState, type ChangeEvent } from 'react';
import { Checkbox, Input } from '@minimalstuff/ui';

import { cn } from '~/lib/cn';

const COLLECTION_SEARCH_THRESHOLD = 6;

type FormLinkCollectionsFieldProps = {
	collections: Data.Collection[];
	selectedIds: Data.Collection['id'][];
	onChange: (collectionIds: Data.Collection['id'][]) => void;
	error?: string;
	disabled: boolean;
};

export function FormLinkCollectionsField({
	collections,
	selectedIds,
	onChange,
	error,
	disabled,
}: Readonly<FormLinkCollectionsFieldProps>) {
	const [collectionSearch, setCollectionSearch] = useState('');

	const toggleCollection = (collectionId: number) => {
		onChange(
			selectedIds.includes(collectionId)
				? selectedIds.filter((id) => id !== collectionId)
				: [...selectedIds, collectionId]
		);
	};

	// The default (Inbox) collection is the implicit home for links with no
	// collection selected, so it's never offered as an explicit choice here.
	const selectableCollections = collections.filter(
		(collection) => !collection.isDefault
	);

	const visibleCollections = selectableCollections.filter((collection) =>
		collection.name.toLowerCase().includes(collectionSearch.toLowerCase())
	);

	const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) =>
		setCollectionSearch(event.target.value);

	return (
		<div>
			<span
				id="collections-label"
				className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
			>
				<Trans>Collections ({selectableCollections.length})</Trans>
			</span>
			{selectableCollections.length > COLLECTION_SEARCH_THRESHOLD && (
				<Input
					type="text"
					value={collectionSearch}
					onChange={handleSearchChange}
					placeholder={t`Search collections`}
					aria-label={t`Search collections`}
					disabled={disabled}
					wrapperClassName="mb-2"
				/>
			)}
			<div
				role="group"
				aria-labelledby="collections-label"
				className={cn(
					'space-y-2 max-h-48 overflow-y-auto rounded-lg border p-3',
					error
						? 'border-red-500 dark:border-red-500'
						: 'border-gray-300 dark:border-gray-600'
				)}
			>
				{visibleCollections.map((collection) => (
					<Checkbox
						key={collection.id}
						id={`collection-${collection.id}`}
						label={collection.name}
						checked={selectedIds.includes(collection.id)}
						onChange={() => toggleCollection(collection.id)}
						disabled={disabled}
					/>
				))}
				{visibleCollections.length === 0 && (
					<p className="text-sm text-gray-500 dark:text-gray-400">
						<Trans>No collections match your search.</Trans>
					</p>
				)}
			</div>
			{selectedIds.length === 0 && (
				<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
					<Trans>No collection selected. This link goes to your Inbox.</Trans>
				</p>
			)}
			{error && (
				<p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
			)}
		</div>
	);
}
