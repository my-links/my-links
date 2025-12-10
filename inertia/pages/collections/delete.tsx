import { Collection } from '#shared/types/dto';
import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
	FormCollection,
	FormCollectionData,
} from '~/components/form/form_collection';
import { useRouteHelper } from '~/lib/route_helper';

interface DeleteCollectionPageProps {
	collection: Collection;
}

export default function DeleteCollectionPage({
	collection,
}: DeleteCollectionPageProps) {
	const { t } = useTranslation('common');
	const { data, setData, submit, processing, errors } =
		useForm<FormCollectionData>({
			name: collection.name,
			description: collection.description,
			visibility: collection.visibility,
		});

	const { route } = useRouteHelper();

	const handleSubmit = () => {
		const { method, url } = route('collection.delete', {
			params: { id: collection.id.toString() },
		});
		submit(method, url);
	};

	return (
		<FormCollection
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
