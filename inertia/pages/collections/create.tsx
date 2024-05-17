import { useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import FormCollection, {
  FormCollectionData,
} from '~/components/form/form_collection';
import { Visibility } from '../../../app/enums/visibility';
import { useTranslation } from 'react-i18next';

export default function CreateCollectionPage({
  disableHomeLink,
}: {
  disableHomeLink: boolean;
}) {
  const { t } = useTranslation('common');
  const { data, setData, post, processing } = useForm<FormCollectionData>({
    name: '',
    description: '',
    visibility: Visibility.PRIVATE,
  });
  const isFormDisabled = useMemo(
    () => processing || data.name.length === 0,
    [processing, data]
  );

  const handleSubmit = () => post('/collections');

  return (
    <FormCollection
      title={t('collection.create')}
      canSubmit={!isFormDisabled}
      disableHomeLink={disableHomeLink}
      data={data}
      setData={setData}
      handleSubmit={handleSubmit}
    />
  );
}
