import { i18n } from '@lingui/core';
import { Trans as TransComponent } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';
import { FormCollectionData } from '~/components/form/form_collection';
import { Visibility } from '~/types/app';

interface FormCollectionContentProps {
	data: FormCollectionData;
	setData: (name: string, value: any) => void;
	errors?: Record<string, string | string[]>;
	disableInputs?: boolean;
}

export const FormCollectionContent = ({
	data,
	setData,
	errors,
	disableInputs = false,
}: FormCollectionContentProps) => (
	<div className="space-y-4">
		<div>
			<label
				htmlFor="name"
				className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
			>
				{i18n._('common:form.name')}
			</label>
			<input
				type="text"
				id="name"
				value={data.name}
				onChange={(e) => setData('name', e.target.value)}
				placeholder={i18n._('common:form.name')}
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
				htmlFor="description"
				className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
			>
				{i18n._('common:form.description')}
			</label>
			<textarea
				id="description"
				value={data.description ?? ''}
				onChange={(e) => setData('description', e.target.value)}
				placeholder={i18n._('common:form.description')}
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
			<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
				<Trans>Visibility</Trans>
			</label>
			<div className="flex items-center gap-4">
				<label className="flex items-center gap-2 cursor-pointer">
					<input
						type="radio"
						name="visibility"
						value={Visibility.PRIVATE}
						checked={data.visibility === Visibility.PRIVATE}
						onChange={(e) =>
							setData('visibility', e.target.value as Visibility)
						}
						className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
						disabled={disableInputs}
					/>
					<span className="text-sm text-gray-700 dark:text-gray-300">
						<TransComponent id="common:visibility.private" message="Private" />
					</span>
				</label>
				<label className="flex items-center gap-2 cursor-pointer">
					<input
						type="radio"
						name="visibility"
						value={Visibility.PUBLIC}
						checked={data.visibility === Visibility.PUBLIC}
						onChange={(e) =>
							setData('visibility', e.target.value as Visibility)
						}
						className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
						disabled={disableInputs}
					/>
					<span className="text-sm text-gray-700 dark:text-gray-300">
						<TransComponent id="common:visibility.public" message="Public" />
					</span>
				</label>
			</div>
			{data.visibility === Visibility.PUBLIC && (
				<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
					<Trans>The content will be visible to everyone</Trans>
				</p>
			)}
		</div>
	</div>
);
