import { Collection } from '#shared/types/dto';
import { Checkbox, Select, TextInput } from '@mantine/core';
import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import BackToDashboard from '~/components/common/navigation/back_to_dashboard';
import useSearchParam from '~/hooks/use_search_param';
import { FormLayout, FormLayoutProps } from '~/layouts/form_layout';

export type FormLinkData = {
	name: string;
	description: string | null;
	url: string;
	favorite: boolean;
	collectionId: Collection['id'];
};

interface FormLinkProps extends FormLayoutProps {
	data: FormLinkData;
	errors?: Record<string, Array<string>>;
	collections: Collection[];
	disableInputs?: boolean;

	setData: (name: string, value: any) => void;
	handleSubmit: () => void;
}

export function FormLink({
	data,
	errors,
	collections,
	disableInputs = false,
	setData,
	handleSubmit,
	...props
}: FormLinkProps) {
	const { t } = useTranslation('common');
	const collectionId =
		Number(useSearchParam('collectionId')) ?? collections?.[0].id;

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
					label={t('form.url')}
					placeholder={t('form.url')}
					onChange={({ target }) => setData('url', target.value)}
					value={data.url ?? undefined}
					readOnly={disableInputs}
					error={errors?.link}
					mt="md"
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
				<Select
					label={t('collection.collections')}
					placeholder={t('collection.collections')}
					data={collections.map(({ id, name }) => ({
						label: name,
						value: id.toString(),
					}))}
					onChange={(value) => setData('collectionId', value)}
					value={data.collectionId?.toString()}
					readOnly={disableInputs}
					mt="md"
					searchable
					required
				/>
				<Checkbox
					label={t('favorite')}
					onChange={({ target }) => setData('favorite', target.checked)}
					checked={data.favorite}
					error={errors?.favorite}
					disabled={disableInputs} // readonly not working
					mt="md"
				/>
			</BackToDashboard>
		</FormLayout>
	);
}
