import { Collection } from '#shared/types/dto';
import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';
import { FormLinkData } from '~/types/link_form';

interface FormLinkContentProps {
	data: FormLinkData;
	setData: (name: string, value: any) => void;
	errors?: Record<string, string | string[]>;
	collections: Collection[];
	disableInputs?: boolean;
}

export const FormLinkContent = ({
	data,
	setData,
	errors,
	collections,
	disableInputs = false,
}: FormLinkContentProps) => (
	<div className="space-y-4">
		<div>
			<label
				htmlFor="name"
				className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
			>
				<Trans>Name</Trans>
			</label>
			<input
				type="text"
				id="name"
				value={data.name}
				onChange={(e) => setData('name', e.target.value)}
				className={clsx(
					'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
					errors?.name
						? 'border-red-500 dark:border-red-500'
						: 'border-gray-300 dark:border-gray-600',
					disableInputs && 'bg-gray-50 dark:bg-gray-900 cursor-not-allowed'
				)}
				autoFocus
				required
				readOnly={disableInputs}
			/>
			{errors?.name && (
				<p className="mt-1 text-sm text-red-600 dark:text-red-400">
					{Array.isArray(errors.name) ? errors.name[0] : errors.name}
				</p>
			)}
		</div>

		<div>
			<label
				htmlFor="url"
				className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
			>
				<Trans>URL</Trans>
			</label>
			<input
				type="url"
				id="url"
				value={data.url}
				onChange={(e) => setData('url', e.target.value)}
				className={clsx(
					'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
					errors?.link
						? 'border-red-500 dark:border-red-500'
						: 'border-gray-300 dark:border-gray-600',
					disableInputs && 'bg-gray-50 dark:bg-gray-900 cursor-not-allowed'
				)}
				required
				readOnly={disableInputs}
			/>
			{errors?.link && (
				<p className="mt-1 text-sm text-red-600 dark:text-red-400">
					{Array.isArray(errors.link) ? errors.link[0] : errors.link}
				</p>
			)}
		</div>

		<div>
			<label
				htmlFor="description"
				className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
			>
				<Trans>Description</Trans>
			</label>
			<textarea
				id="description"
				value={data.description ?? ''}
				onChange={(e) => setData('description', e.target.value)}
				rows={3}
				className={clsx(
					'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none',
					errors?.description
						? 'border-red-500 dark:border-red-500'
						: 'border-gray-300 dark:border-gray-600',
					disableInputs && 'bg-gray-50 dark:bg-gray-900 cursor-not-allowed'
				)}
				readOnly={disableInputs}
			/>
			{errors?.description && (
				<p className="mt-1 text-sm text-red-600 dark:text-red-400">
					{Array.isArray(errors.description)
						? errors.description[0]
						: errors.description}
				</p>
			)}
		</div>

		<div>
			<label
				htmlFor="collectionId"
				className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
			>
				<Trans>Collections ({collections.length})</Trans>
			</label>
			<select
				id="collectionId"
				value={data.collectionId?.toString()}
				onChange={(e) =>
					setData(
						'collectionId',
						e.target.value ? Number(e.target.value) : null
					)
				}
				className={clsx(
					'w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
					errors?.collectionId
						? 'border-red-500 dark:border-red-500'
						: 'border-gray-300 dark:border-gray-600',
					disableInputs && 'bg-gray-50 dark:bg-gray-900 cursor-not-allowed'
				)}
				required
				disabled={disableInputs}
			>
				{collections.map((collection) => (
					<option key={collection.id} value={collection.id}>
						{collection.name}
					</option>
				))}
			</select>
			{errors?.collectionId && (
				<p className="mt-1 text-sm text-red-600 dark:text-red-400">
					{Array.isArray(errors.collectionId)
						? errors.collectionId[0]
						: errors.collectionId}
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
					{Array.isArray(errors.favorite)
						? errors.favorite[0]
						: errors.favorite}
				</p>
			)}
		</div>
	</div>
);
