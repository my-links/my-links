import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Checkbox from '~/components/common/form/checkbox';
import Selector from '~/components/common/form/selector';
import TextBox from '~/components/common/form/textbox';
import BackToDashboard from '~/components/common/navigation/back_to_dashboard';
import FormLayout from '~/components/layouts/form_layout';
import useSearchParam from '~/hooks/use_search_param';
import { Collection } from '~/types/app';

export type FormLinkData = {
	name: string;
	description: string | null;
	url: string;
	favorite: boolean;
	collectionId: Collection['id'];
};

interface FormLinkProps {
	title: string;
	canSubmit: boolean;
	disableHomeLink?: boolean;
	data: FormLinkData;
	errors?: Record<string, Array<string>>;
	collections: Collection[];
	disableInputs?: boolean;
	submitBtnDanger?: boolean;

	setData: (name: string, value: any) => void;
	handleSubmit: () => void;
}

export default function FormLink({
	title,
	canSubmit,
	disableHomeLink,
	data,
	errors,
	collections,
	disableInputs = false,
	submitBtnDanger = false,

	setData,
	handleSubmit,
}: FormLinkProps) {
	const { t } = useTranslation('common');
	const collectionId =
		Number(useSearchParam('collectionId')) ?? collections?.[0].id;

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		handleSubmit();
	};

	return (
		<FormLayout
			title={title}
			handleSubmit={onSubmit}
			canSubmit={canSubmit}
			disableHomeLink={disableHomeLink}
			collectionId={collectionId}
			submitBtnDanger={submitBtnDanger}
		>
			<BackToDashboard>
				<TextBox
					label={t('link.name')}
					placeholder={t('link.name')}
					name="name"
					onChange={setData}
					value={data.name}
					errors={errors?.name}
					disabled={disableInputs}
					required
					autoFocus
				/>
				<TextBox
					label={t('link.link')}
					placeholder={t('link.link')}
					name="url"
					onChange={setData}
					value={data.url}
					errors={errors?.url}
					disabled={disableInputs}
					required
				/>
				<TextBox
					label={t('link.description')}
					placeholder={t('link.description')}
					name="description"
					onChange={setData}
					value={data.description ?? undefined}
					errors={errors?.description}
					disabled={disableInputs}
				/>
				<Selector
					label={t('collection.collections')}
					name="collection"
					placeholder={t('collection.collections')}
					value={data.collectionId}
					onChangeCallback={(value) => setData('collectionId', value)}
					options={collections.map(({ id, name }) => ({
						label: name,
						value: id,
					}))}
					required
				/>
				<Checkbox
					label={t('favorite')}
					name="favorite"
					onChange={setData}
					checked={data.favorite}
					errors={errors?.favorite}
					disabled={disableInputs}
				/>
			</BackToDashboard>
		</FormLayout>
	);
}
