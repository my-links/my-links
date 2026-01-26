import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Button } from '~/components/common/button';
import { FormField } from '~/components/common/form_field';
import { Input } from '~/components/common/input';
import { Textarea } from '~/components/common/textarea';
import { EmojiPicker } from '~/components/common/emoji_picker';
import { Visibility } from '~/types/app';
import { FormCollectionData } from '~/types/collection_form';

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
}: FormCollectionContentProps) => {
	const handleEmojiClick = (emoji: string | null) => setData('icon', emoji);
	const handleRemoveIcon = () => setData('icon', null);

	return (
		<div className="space-y-4">
			<div>
				<label
					htmlFor="icon"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
				>
					<Trans>Icon</Trans>
				</label>
				<div className="flex items-center gap-2">
					<EmojiPicker
						selectedEmoji={data.icon}
						setSelectedEmoji={handleEmojiClick}
						disabled={disableInputs}
					/>
					{data.icon && !disableInputs && (
						<Button
							variant="secondary"
							size="sm"
							type="button"
							onClick={handleRemoveIcon}
						>
							<Trans>Remove</Trans>
						</Button>
					)}
				</div>
			</div>

			<FormField label={t`Name`} htmlFor="name" error={errors?.name} required>
				<Input
					type="text"
					id="name"
					value={data.name}
					onChange={(e) => setData('name', e.target.value)}
					placeholder={t`Name`}
					error={errors?.name}
					disabled={disableInputs}
					readOnly={disableInputs}
					autoFocus
					required
				/>
			</FormField>

			<FormField
				label={t`Description`}
				htmlFor="description"
				error={errors?.description}
			>
				<Textarea
					id="description"
					value={data.description ?? ''}
					onChange={(e) => setData('description', e.target.value)}
					placeholder={t`Description`}
					rows={3}
					error={errors?.description}
					disabled={disableInputs}
					readOnly={disableInputs}
				/>
			</FormField>

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
							<Trans>Private</Trans>
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
							<Trans>Public</Trans>
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
};
