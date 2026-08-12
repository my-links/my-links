import { t } from '@lingui/core/macro';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { Button, Input, RadioOptions, Textarea } from '@minimalstuff/ui';

import { EmojiPicker } from '~/components/common/emoji_picker';

export type Visibility = Data.Collection['visibility'];

export type FormCollectionData = {
	name: string;
	description: string | null;
	visibility: Visibility;
	icon: string | null;
};

interface FormCollectionContentProps {
	data: FormCollectionData;
	setData: <TKey extends keyof FormCollectionData>(
		name: TKey,
		value: FormCollectionData[TKey]
	) => void;
	errors?: Record<string, string | string[]>;
	disableInputs?: boolean;
}

export const FormCollectionContent = ({
	data,
	setData,
	errors,
	disableInputs = false,
}: Readonly<FormCollectionContentProps>) => {
	const handleEmojiClick = (emoji: string | null) => setData('icon', emoji);
	const handleRemoveIcon = () => setData('icon', null);

	const visibilityOptions = [
		{
			value: 'PRIVATE',
			label: t`Private`,
			description: t`Only you can see this collection`,
		},
		{
			value: 'PUBLIC',
			label: t`Public`,
			description: t`The content will be visible to everyone`,
		},
	];

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
							variant="outline"
							color="neutral"
							size="sm"
							type="button"
							onClick={handleRemoveIcon}
						>
							<Trans>Remove</Trans>
						</Button>
					)}
				</div>
			</div>

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

			<Textarea
				label={t`Description`}
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

			<RadioOptions
				label={<Trans>Visibility</Trans>}
				options={visibilityOptions}
				value={data.visibility}
				onChange={(value) => setData('visibility', value as Visibility)}
				orientation="horizontal"
				disabled={disableInputs}
				required
			/>
		</div>
	);
};
