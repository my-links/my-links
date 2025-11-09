import { Box, Group, SegmentedControl, Text, TextInput } from '@mantine/core';
import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import BackToDashboard from '~/components/common/navigation/back_to_dashboard';
import useSearchParam from '~/hooks/use_search_param';
import { FormLayout, FormLayoutProps } from '~/layouts/form_layout';
import { Visibility } from '~/types/app';

export type FormCollectionData = {
	name: string;
	description: string | null;
	visibility: Visibility;
};

interface FormCollectionProps extends FormLayoutProps {
	data: FormCollectionData;
	errors?: Record<string, Array<string>>;
	disableInputs?: boolean;

	setData: (name: string, value: any) => void;
	handleSubmit: () => void;
}

export function MantineFormCollection({
	data,
	errors,
	disableInputs = false,
	setData,
	handleSubmit,
	...props
}: FormCollectionProps) {
	const { t } = useTranslation('common');
	const collectionId = Number(useSearchParam('collectionId'));

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		handleSubmit();
	};

	return (
		<FormLayout handleSubmit={onSubmit} collectionId={collectionId} {...props}>
			<BackToDashboard disabled={props.disableHomeLink}>
				<TextInput
					label={t('form.name')}
					placeholder={t('form.name')}
					onChange={({ target }) => setData('name', target.value)}
					value={data.name}
					readOnly={disableInputs}
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
					readOnly={disableInputs}
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
							readOnly={disableInputs}
						/>
						{data.visibility === Visibility.PUBLIC && (
							<Text c="dimmed" size="sm">
								{t('form.visibility-warning')}
							</Text>
						)}
					</Group>
				</Box>
			</BackToDashboard>
		</FormLayout>
	);
}
