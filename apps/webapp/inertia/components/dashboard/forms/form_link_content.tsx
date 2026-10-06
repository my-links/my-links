import { t } from '@lingui/core/macro';
import type { ChangeEvent } from 'react';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { Checkbox, Input, Textarea } from '@minimalstuff/ui';

import { FormLinkCollectionsField } from '~/components/dashboard/forms/form_link_collections_field';

export type FormLinkData = {
	name: string;
	description: string | null;
	url: string;
	favorite: boolean;
	collectionIds: Data.Collection['id'][];
};

type FormLinkContentProps = {
	data: FormLinkData;
	setData: <TKey extends keyof FormLinkData>(
		name: TKey,
		value: FormLinkData[TKey]
	) => void;
	errors?: Record<string, string | string[]>;
	collections: Data.Collection[];
	disableInputs?: boolean;
};

export function FormLinkContent({
	data,
	setData,
	errors,
	collections,
	disableInputs = false,
}: Readonly<FormLinkContentProps>) {
	const handleNameChange = (event: ChangeEvent<HTMLInputElement>) =>
		setData('name', event.target.value);

	const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) =>
		setData('url', event.target.value);

	const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
		setData('description', event.target.value);

	const handleFavoriteChange = (event: ChangeEvent<HTMLInputElement>) =>
		setData('favorite', event.target.checked);

	const handleCollectionIdsChange = (collectionIds: number[]) =>
		setData('collectionIds', collectionIds);

	const collectionsError = Array.isArray(errors?.collectionIds)
		? errors.collectionIds[0]
		: errors?.collectionIds;

	return (
		<div className="space-y-4">
			<Input
				label={t`Name`}
				type="text"
				id="name"
				value={data.name}
				onChange={handleNameChange}
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
				onChange={handleUrlChange}
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
				onChange={handleDescriptionChange}
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

			<FormLinkCollectionsField
				collections={collections}
				selectedIds={data.collectionIds}
				onChange={handleCollectionIdsChange}
				error={collectionsError}
				disabled={disableInputs}
			/>

			<Checkbox
				id="favorite"
				label={<Trans>Favorite</Trans>}
				checked={data.favorite}
				onChange={handleFavoriteChange}
				disabled={disableInputs}
				error={
					Array.isArray(errors?.favorite)
						? errors.favorite[0]
						: errors?.favorite
				}
			/>
		</div>
	);
}
