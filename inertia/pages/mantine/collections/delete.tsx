import { useForm } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { useTranslation } from 'react-i18next';
import MantineFormCollection, {
	FormCollectionData,
} from '~/mantine/components/form/mantine_form_collection';
import { Collection } from '~/types/app';

export default function DeleteCollectionPage({
	collection,
}: {
	collection: Collection;
}) {
	const { t } = useTranslation('common');
	const { data, setData, submit, processing, errors } =
		useForm<FormCollectionData>({
			name: collection.name,
			description: collection.description,
			visibility: collection.visibility,
		});

	const handleSubmit = () => {
		const { method, url } = route('collection.delete', {
			params: { id: collection.id.toString() },
		});
		submit(method, url);
	};

	return (
		<MantineFormCollection
			title={t('collection.delete')}
			textSubmitButton={t('form.delete')}
			canSubmit={!processing}
			data={data}
			setData={setData}
			handleSubmit={handleSubmit}
			errors={errors as any}
			disableInputs
			submitBtnDanger
		/>
	);
}
