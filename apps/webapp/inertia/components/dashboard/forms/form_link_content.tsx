import type { Data } from '@generated/data';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Input, Textarea } from '@minimalstuff/ui';
import clsx from 'clsx';
import { FormField } from '~/components/common/form_field';
import { Select } from '~/components/common/select';
import { FormLinkData } from '~/types/link_form';

interface FormLinkContentProps {
	data: FormLinkData;
	setData: (name: string, value: string | null) => void;
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
}: Readonly<FormLinkContentProps>) => (
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
						: errors?.url ||
							(Array.isArray(errors?.link) ? errors.link[0] : errors?.link)
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

		<FormField
			label={<Trans>Collections ({collections.length})</Trans>}
			htmlFor="collectionId"
			error={errors?.collectionId}
			required
		>
			<Select
				id="collectionId"
				value={data.collectionId?.toString()}
				onChange={(e) =>
					setData(
						'collectionId',
						e.target.value ? Number(e.target.value) : null
					)
				}
				error={errors?.collectionId}
				disabled={disableInputs}
				required
			>
				{collections.map((collection) => (
					<option key={collection.id} value={collection.id}>
						{collection.name}
					</option>
				))}
			</Select>
		</FormField>

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
