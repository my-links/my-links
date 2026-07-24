import clsx from 'clsx';
import { t } from '@lingui/core/macro';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { Input, Textarea } from '@minimalstuff/ui';

import { FormLinkData } from '~/types/link_form';
import { FormField } from '~/components/common/form_field';

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

	return (
		<div className="space-y-4">
			<FormField
				label={<Trans>Name</Trans>}
				htmlFor="name"
				error={errors?.name}
				required
			>
				<Input
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
			</FormField>

			<FormField
				label={<Trans>URL</Trans>}
				htmlFor="url"
				error={errors?.url}
				required
			>
				<Input
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
			</FormField>

			<FormField
				label={<Trans>Description</Trans>}
				htmlFor="description"
				error={errors?.description}
			>
				<Textarea
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
			</FormField>

			<div>
				<span
					id="collections-label"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
				>
					<Trans>Collections ({collections.length})</Trans>
				</span>
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
					{collections.map((collection) => (
						<div key={collection.id} className="flex items-center gap-2">
							<input
								type="checkbox"
								id={`collection-${collection.id}`}
								checked={data.collectionIds.includes(collection.id)}
								onChange={() => toggleCollection(collection.id)}
								className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
								disabled={disableInputs}
							/>
							<label
								htmlFor={`collection-${collection.id}`}
								className={clsx(
									'text-sm text-gray-700 dark:text-gray-300',
									!disableInputs && 'cursor-pointer'
								)}
							>
								{collection.name}
							</label>
						</div>
					))}
				</div>
				{data.collectionIds.length === 0 && (
					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
						<Trans>
							No collection selected — this link goes to your Inbox.
						</Trans>
					</p>
				)}
				{collectionsError && (
					<p className="mt-1 text-sm text-red-600 dark:text-red-400">
						{collectionsError}
					</p>
				)}
			</div>

			<div className="flex items-center gap-2">
				<input
					type="checkbox"
					id="favorite"
					checked={data.favorite}
					onChange={(e) => setData('favorite', e.target.checked)}
					className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
					disabled={disableInputs}
				/>
				<label
					htmlFor="favorite"
					className={clsx(
						'text-sm text-gray-700 dark:text-gray-300',
						!disableInputs && 'cursor-pointer'
					)}
				>
					<Trans>Favorite</Trans>
				</label>
				{errors?.favorite && (
					<p className="text-sm text-red-600 dark:text-red-400">
						{errors.favorite}
					</p>
				)}
			</div>
		</div>
	);
};
