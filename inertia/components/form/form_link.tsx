import type Collection from '#models/collection';
import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Checkbox from '~/components/common/form/checkbox';
import TextBox from '~/components/common/form/textbox';
import BackToDashboard from '~/components/common/navigation/back_to_dashboard';
import FormLayout from '~/components/layouts/form_layout';
import useSearchParam from '~/hooks/use_search_param';

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

  setData,
  handleSubmit,
}: FormLinkProps) {
  const { t } = useTranslation('common');
  const collectionId = useSearchParam('collectionId') ?? collections[0].id;

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
    >
      <BackToDashboard>
        <TextBox
          label={t('link.name')}
          placeholder={t('link.name')}
          name="name"
          onChange={setData}
          value={data.name}
          errors={errors?.name}
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
          required
        />
        <TextBox
          label={t('link.description')}
          placeholder={t('link.description')}
          name="description"
          onChange={setData}
          value={data.description ?? undefined}
          errors={errors?.description}
        />
        <select
          onChange={({ target }) => setData('collectionId', target.value)}
          defaultValue={data.collectionId}
        >
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
        <Checkbox
          label={t('favorite')}
          name="favorite"
          onChange={setData}
          checked={data.favorite}
          errors={errors?.favorite}
        />
      </BackToDashboard>
    </FormLayout>
  );
}
