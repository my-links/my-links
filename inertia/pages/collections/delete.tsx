import type Collection from '#models/collection';
import { useForm } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { useTranslation } from 'react-i18next';
import FormCollection, {
  FormCollectionData,
} from '~/components/form/form_collection';

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
      params: { id: collection.id },
    });
    submit(method, url);
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
