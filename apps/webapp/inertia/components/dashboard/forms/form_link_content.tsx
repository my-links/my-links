import clsx from 'clsx';
import { useState } from 'react';
import { t } from '@lingui/core/macro';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { Checkbox, Input, Textarea } from '@minimalstuff/ui';

export type FormLinkData = {
	name: string;
	description: string | null;
	url: string;
	favorite: boolean;
	collectionIds: Data.Collection['id'][];
};

const COLLECTION_SEARCH_THRESHOLD = 6;

interface FormLinkContentProps {
	data: FormLinkData;
	setData: <TKey extends keyof FormLinkData>(
		name: TKey,
		value: FormLinkData[TKey]
	) => void;
	errors?: Record<string, string | string[]>;
	collections: Data.Collection[];
	disableInputs?: boolean;
}

export const FormLinkContent = ({
	data,
	setData,
	errors,
	collections,
	disableInputs = false,
}: Readonly<FormLinkContentProps>) => {
	const [collectionSearch, setCollectionSearch] = useState('');

	const toggleCollection = (collectionId: number) => {
		setData(
			'collectionIds',
			data.collectionIds.includes(collectionId)
				? data.collectionIds.filter((id) => id !== collectionId)
				: [...data.collectionIds, collectionId]
		);
	};

	const collectionsError = Array.isArray(errors?.collectionIds)
		? errors.collectionIds[0]
		: errors?.collectionIds;

	// The default (Inbox) collection is the implicit home for links with no
	// collection selected, so it's never offered as an explicit choice here.
	const selectableCollections = collections.filter(
		(collection) => !collection.isDefault
	);

	const visibleCollections = selectableCollections.filter((collection) =>
		collection.name.toLowerCase().includes(collectionSearch.toLowerCase())
	);

	return (
		<div className="space-y-4">
			<Input
				label={t`Name`}
				type="text"
				id="name"
				value={data.name}
				onChange={(e) => setData('name', e.target.value)}
				placeholder={t`Name`}
				error={Array.isArray(errors?.name) ? errors.name[0] : errors?.name}
				disabled={disableInputs}
				readOnly={disableInputs}
				autoFocus
				required
			/>

			<Input
				label={t`URL`}
				type="text"
				id="url"
				value={data.url}
				onChange={(e) => setData('url', e.target.value)}
				placeholder={t`URL`}
				error={
					Array.isArray(errors?.url)
						? errors.url[0]
						: (errors?.url ??
							(Array.isArray(errors?.link) ? errors.link[0] : errors?.link))
				}
				disabled={disableInputs}
				readOnly={disableInputs}
				required
			/>

			<Textarea
				label={<Trans>Description</Trans>}
				id="description"
				value={data.description ?? ''}
				onChange={(e) => setData('description', e.target.value)}
				placeholder={t`Description`}
				rows={3}
				error={
					Array.isArray(errors?.description)
						? errors.description[0]
						: errors?.description
				}
				disabled={disableInputs}
				readOnly={disableInputs}
			/>

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
						onChange={(e) => setCollectionSearch(e.target.value)}
						placeholder={t`Search collections`}
						aria-label={t`Search collections`}
						disabled={disableInputs}
						wrapperClassName="mb-2"
					/>
				)}
				<div
					role="group"
					aria-labelledby="collections-label"
					className={clsx(
						'space-y-2 max-h-48 overflow-y-auto rounded-lg border p-3',
						collectionsError
							? 'border-red-500 dark:border-red-500'
							: 'border-gray-300 dark:border-gray-600'
					)}
				>
					{visibleCollections.map((collection) => (
						<Checkbox
							key={collection.id}
							id={`collection-${collection.id}`}
							label={collection.name}
							checked={data.collectionIds.includes(collection.id)}
							onChange={() => toggleCollection(collection.id)}
							disabled={disableInputs}
						/>
					))}
					{visibleCollections.length === 0 && (
						<p className="text-sm text-gray-500 dark:text-gray-400">
							<Trans>No collections match your search.</Trans>
						</p>
					)}
				</div>
				{data.collectionIds.length === 0 && (
					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
						<Trans>No collection selected. This link goes to your Inbox.</Trans>
					</p>
				)}
				{collectionsError && (
					<p className="mt-1 text-sm text-red-600 dark:text-red-400">
						{collectionsError}
					</p>
				)}
			</div>

			<Checkbox
				id="favorite"
				label={<Trans>Favorite</Trans>}
				checked={data.favorite}
				onChange={(e) => setData('favorite', e.target.checked)}
				disabled={disableInputs}
				error={
					Array.isArray(errors?.favorite)
						? errors.favorite[0]
						: errors?.favorite
				}
			/>
		</div>
	);
};
