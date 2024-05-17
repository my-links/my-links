import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Checkbox from '~/components/common/form/checkbox';
import TextBox from '~/components/common/form/textbox';
import BackToDashboard from '~/components/common/navigation/back_to_dashboard';
import FormLayout from '~/components/layouts/form_layout';
import { Visibility } from '../../../app/enums/visibility';

export type FormCollectionData = {
  name: string;
  description: string | null;
  visibility: Visibility;
};

interface FormCollectionProps {
  title: string;
  canSubmit: boolean;
  disableHomeLink?: boolean;
  data: FormCollectionData;
  errors?: Record<string, Array<string>>;

  setData: (name: string, value: any) => void;
  handleSubmit: () => void;
}

export default function FormCollection({
  title,
  canSubmit,
  disableHomeLink,
  data,
  errors,

  setData,
  handleSubmit,
}: FormCollectionProps) {
  const { t } = useTranslation('common');
  const handleOnCheck: FormCollectionProps['setData'] = (name, value) =>
    setData(name, value ? Visibility.PUBLIC : Visibility.PRIVATE);

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
    >
      <BackToDashboard>
        <TextBox
          label={t('collection.name')}
          placeholder={t('collection.name')}
          name="name"
          onChange={setData}
          value={data.name}
          errors={errors?.name}
          required
          autoFocus
        />
        <TextBox
          label={t('collection.description')}
          placeholder={t('collection.description')}
          name="description"
          onChange={setData}
          value={data.description ?? undefined}
          errors={errors?.description}
        />
        <Checkbox
          label="Public"
          name="visibility"
          onChange={handleOnCheck}
          checked={data.visibility === Visibility.PUBLIC}
        />
      </BackToDashboard>
    </FormLayout>
  );
}
