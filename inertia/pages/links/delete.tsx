import type Link from '#models/link';
import { useForm } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { useTranslation } from 'react-i18next';
import FormLink from '~/components/form/form_link';

export default function DeleteLinkPage({ link }: { link: Link }) {
  const { t } = useTranslation('common');
  const { data, setData, submit, processing } = useForm({
    name: link.name,
    description: link.description,
    url: link.url,
    favorite: link.favorite,
    collectionId: link.collectionId,
  });

  const handleSubmit = () => {
    const { method, url } = route('link.delete', { params: { id: link.id } });
    submit(method, url);
  };
  console.log(link);

  return (
    <FormLink
      title={t('link.delete')}
      canSubmit={!processing}
      data={data}
      setData={setData}
      handleSubmit={handleSubmit}
      collections={[link.collection]}
      disableInputs
      submitBtnDanger
    />
  );
}