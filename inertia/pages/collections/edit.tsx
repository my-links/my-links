import { Collection } from '#shared/types/dto';
import { useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	FormCollection,
	FormCollectionData,
} from '~/components/form/form_collection';
import { useRouteHelper } from '~/lib/route_helper';

interface EditCollectionPageProps {
	collection: Collection;
}

export default function EditCollectionPage({
	collection,
}: EditCollectionPageProps) {
	const { t } = useTranslation('common');
	const { data, setData, submit, processing, errors } =
		useForm<FormCollectionData>({
			name: collection.name,
			description: collection.description,
			visibility: collection.visibility,
		});
	const canSubmit = useMemo<boolean>(() => {
		const trimmedName = data.name.trim();
		const trimmedDescription = data.description?.trim();
		const isFormEdited =
			trimmedName !== collection.name ||
			trimmedDescription !== collection.description ||
			data.visibility !== collection.visibility;
		const isFormValid = trimmedName !== '';
		return isFormEdited && isFormValid && !processing;
	}, [data, collection]);

	const { route } = useRouteHelper();

	const handleSubmit = () => {
		const { method, url } = route('collection.edit', {
			params: { id: collection.id.toString() },
		});
		submit(method, url);
	};

	return (
		<FormCollection
			title={t('collection.edit')}
			textSubmitButton={t('form.update')}
			canSubmit={canSubmit}
			data={data}
			setData={setData}
			handleSubmit={handleSubmit}
			// TODO: fix this, type mistmatch (Record<string, string[]> sent by the backend, but useForm expects a Record<string, string>)
			errors={errors as any}
		/>
	);
}
