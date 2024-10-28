import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import FormCollection, {
	FormCollectionData,
} from '~/components/form/form_collection';
import { tuyau } from '~/lib/tuyau';
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
		const { method, path } = tuyau.$route('collection.delete', {
			id: collection.id.toString(),
		});
		submit(method.at(0) as any, path);
	};

	return (
		<FormCollection
			title={t('collection.delete')}
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
