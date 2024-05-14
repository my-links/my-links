import { ChangeEvent, FormEvent } from 'react';
import FormField from '~/components/common/form/_form_field';
import TextBox from '~/components/common/form/textbox';
import BackToDashboard from '~/components/common/navigation/back_to_dashboard';
import FormLayout from '~/components/layouts/form_layout';
import { Visibility } from '../../../app/enums/visibility';

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

  setData,
  handleSubmit,
}: {
  title: string;
  canSubmit: boolean;
  disableHomeLink?: boolean;
  data: FormCollectionData;

  setData: (name: string, value: string) => void;
  handleSubmit: () => void;
}) {
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
          label="Collection name"
          placeholder="Collection name"
          name="name"
          onChange={setData}
          value={data.name}
          required
          autoFocus
        />
        <TextBox
          label="Collection description"
          placeholder="Collection description"
          name="description"
          onChange={setData}
          value={data.description ?? undefined}
        />
        <FormField>
          <label htmlFor="visibility">Public</label>
          <input
            type="checkbox"
            onChange={handleOnCheck}
            value={data.visibility}
            id="visibility"
          />
        </FormField>
      </BackToDashboard>
    </FormLayout>
  );
}
