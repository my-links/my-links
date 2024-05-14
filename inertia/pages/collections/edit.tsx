import type Collection from '#models/collection';
import { useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import FormCollection, {
  FormCollectionData,
} from '~/components/form/form_collection';

export default function EditCollectionPage({
  collection,
}: {
  collection: Collection;
}) {
  const { data, setData, put, processing, errors } =
    useForm<FormCollectionData>({
      name: collection.name,
      description: collection.description,
      visibility: collection.visibility,
    });
  const canSubmit = useMemo<boolean>(() => {
    const isFormEdited =
      data.name !== collection.name ||
      data.description !== collection.description ||
      data.visibility !== collection.visibility;
    const isFormValid = data.name !== '';
    return isFormEdited && isFormValid && !processing;
  }, [data, collection]);

  const handleSubmit = () => put(`/collections/${collection.id}`);

  return (
    <FormCollection
      title="Edit a collection"
      canSubmit={canSubmit}
      data={data}
      setData={setData}
      handleSubmit={handleSubmit}
      // TODO: fix this, type mistmatch (Record<string, string[]> sent by the backend, but useForm expects a Record<string, string>)
      errors={errors as any}
    />
  );
}
