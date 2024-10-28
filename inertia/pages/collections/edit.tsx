import { useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FormCollection, {
	FormCollectionData,
} from '~/components/form/form_collection';
import { tuyau } from '~/lib/tuyau';
import { Collection } from '~/types/app';

export default function EditCollectionPage({
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
			nextId: collection.nextId,
		});
	const canSubmit = useMemo<boolean>(() => {
		const isFormEdited =
			data.name !== collection.name ||
			data.description !== collection.description ||
			data.visibility !== collection.visibility;
		const isFormValid = data.name !== '';
		return isFormEdited && isFormValid && !processing;
	}, [data, collection]);

	const handleSubmit = () => {
		const { method, path } = tuyau.$route('collection.edit', {
			id: collection.id.toString(),
		});
		submit(method.at(0) as any, path);
	};

	return (
		<FormCollection
			title={t('collection.edit')}
			canSubmit={canSubmit}
			data={data}
			setData={setData}
			handleSubmit={handleSubmit}
			// TODO: fix this, type mistmatch (Record<string, string[]> sent by the backend, but useForm expects a Record<string, string>)
			errors={errors as any}
		/>
	);
}
