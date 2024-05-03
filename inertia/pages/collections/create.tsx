import { useForm } from '@inertiajs/react';
import { ChangeEvent, FormEvent, useMemo } from 'react';
import FormField from '~/components/common/form/_form_field';
import TextBox from '~/components/common/form/textbox';
import BackToDashboard from '~/components/common/navigation/bask_to_dashboard';
import FormLayout from '~/components/layouts/form_layout';
import { Visibility } from '../../../app/enums/visibility';

export default function CreateCollectionPage() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    visibility: Visibility.PRIVATE,
  });
  const isFormDisabled = useMemo(
    () => processing || data.name.length === 0,
    [processing, data]
  );

  function handleOnCheck({ target }: ChangeEvent<HTMLInputElement>) {
    setData(
      'visibility',
      target.checked ? Visibility.PUBLIC : Visibility.PRIVATE
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    post('/collections');
  }

  return (
    <FormLayout
      title="Create a collection"
      handleSubmit={handleSubmit}
      canSubmit={!isFormDisabled}
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
        {errors.name && <div>{errors.name}</div>}
        <TextBox
          label="Collection description"
          placeholder="Collection description"
          name="description"
          onChange={setData}
          value={data.name}
        />
        {errors.description && <div>{errors.description}</div>}
        <FormField>
          <label htmlFor="visibility">Public</label>
          <input type="checkbox" onChange={handleOnCheck} id="visibility" />
        </FormField>
      </BackToDashboard>
    </FormLayout>
  );
}
