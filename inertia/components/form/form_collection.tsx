import { ChangeEvent, FormEvent } from 'react';
import FormField from '~/components/common/form/_form_field';
import TextBox from '~/components/common/form/textbox';
import BackToDashboard from '~/components/common/navigation/back_to_dashboard';
import FormLayout from '~/components/layouts/form_layout';
import { Visibility } from '../../../app/enums/visibility';
import { useTranslation } from 'react-i18next';

export type FormCollectionData = {
  name: string;
  description: string | null;
  visibility: Visibility;
};

export default function FormCollection({
  title,
  canSubmit,
  disableHomeLink,
  data,
  errors,

  setData,
  handleSubmit,
}: {
  title: string;
  canSubmit: boolean;
  disableHomeLink?: boolean;
  data: FormCollectionData;
  errors?: Record<string, Array<string>>;

  setData: (name: string, value: string) => void;
  handleSubmit: () => void;
}) {
  const { t } = useTranslation('common');
  const handleOnCheck = ({ target }: ChangeEvent<HTMLInputElement>) =>
    setData(
      'visibility',
      target.checked ? Visibility.PUBLIC : Visibility.PRIVATE
    );

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
          label={t('collection.name')}
          placeholder={t('collection.name')}
          name="description"
          onChange={setData}
          value={data.description ?? undefined}
          errors={errors?.description}
        />
        <FormField>
          <label htmlFor="visibility">Public</label>
          <input
            type="checkbox"
            onChange={handleOnCheck}
            checked={data.visibility === Visibility.PUBLIC}
            id="visibility"
          />
        </FormField>
      </BackToDashboard>
    </FormLayout>
  );
}
