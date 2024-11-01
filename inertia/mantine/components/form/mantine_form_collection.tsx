import { Visibility } from '#enums/visibility';
import { Box, Group, SegmentedControl, Text, TextInput } from '@mantine/core';
import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import BackToDashboard from '~/components/common/navigation/back_to_dashboard';
import { MantineFormLayout } from '~/mantine/layouts/mantine_form_layout';
import { Collection } from '~/types/app';

export type FormCollectionData = {
	name: string;
	description: string | null;
	visibility: Visibility;
	nextId?: Collection['id'];
};

interface FormCollectionProps {
	title: string;
	canSubmit: boolean;
	disableHomeLink?: boolean;
	data: FormCollectionData;
	errors?: Record<string, Array<string>>;
	disableInputs?: boolean;
	submitBtnDanger?: boolean;

	setData: (name: string, value: any) => void;
	handleSubmit: () => void;
}

export default function MantineFormCollection({
	title,
	canSubmit,
	disableHomeLink,
	data,
	errors,
	disableInputs = false,
	submitBtnDanger = false,

	setData,
	handleSubmit,
}: FormCollectionProps) {
	const { t } = useTranslation('common');

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		handleSubmit();
	};

	return (
		<MantineFormLayout
			title={title}
			handleSubmit={onSubmit}
			canSubmit={canSubmit}
			disableHomeLink={disableHomeLink}
			submitBtnDanger={submitBtnDanger}
		>
			<BackToDashboard>
				<TextInput
					label={t('form.name')}
					placeholder={t('form.name')}
					onChange={({ target }) => setData('name', target.value)}
					value={data.name}
					disabled={disableInputs}
					error={errors?.name}
					mt="md"
					autoFocus
					required
				/>
				<TextInput
					label={t('form.description')}
					placeholder={t('form.description')}
					onChange={({ target }) => setData('description', target.value)}
					value={data.description ?? undefined}
					disabled={disableInputs}
					error={errors?.description}
					mt="md"
				/>
				<Box mt="md">
					<Text size="sm" fw={500} mb={3}>
						{t('form.visibility')}
					</Text>
					<Group wrap="nowrap">
						<SegmentedControl
							data={[
								{ label: t('visibility.private'), value: Visibility.PRIVATE },
								{ label: t('visibility.public'), value: Visibility.PUBLIC },
							]}
							onChange={(value) => setData('visibility', value as Visibility)}
							value={data.visibility}
							style={{ minWidth: 'fit-content' }}
						/>
						{data.visibility === Visibility.PUBLIC && (
							<Text c="dimmed" size="sm">
								{t('form.visibility-warning')}
							</Text>
						)}
					</Group>
				</Box>
			</BackToDashboard>
		</MantineFormLayout>
	);
}
