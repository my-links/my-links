import type Collection from '#models/collection';
import { useForm } from '@inertiajs/react';
import { ChangeEvent, FormEvent, useMemo } from 'react';
import FormField from '~/components/common/form/_form_field';
import TextBox from '~/components/common/form/textbox';
import BackToDashboard from '~/components/common/navigation/back_to_dashboard';
import FormLayout from '~/components/layouts/form_layout';
import useSearchParam from '~/hooks/use_search_param';
import { isValidHttpUrl } from '~/lib/navigation';

export default function CreateLinkPage({
  collections,
}: {
  collections: Collection[];
}) {
  const collectionId = useSearchParam('collectionId') ?? collections[0].id;
  const { data, setData, post, processing } = useForm({
    name: '',
    description: '',
    url: '',
    favorite: false,
    collectionId: collectionId,
  });

  const canSubmit = useMemo<boolean>(
    () =>
      data.name !== '' &&
      isValidHttpUrl(data.url) &&
      data.favorite !== null &&
      data.collectionId !== null &&
      !processing,
    [data, processing]
  );

  const handleOnCheck = ({ target }: ChangeEvent<HTMLInputElement>) => {
    setData('favorite', !!target.checked);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post('/links');
  };

  return (
    <FormLayout
      title="Create a link"
      handleSubmit={handleSubmit}
      canSubmit={canSubmit}
      collectionId={collectionId}
    >
      <BackToDashboard>
        <TextBox
          label="Link name"
          placeholder="Link name"
          name="name"
          onChange={setData}
          value={data.name}
          required
          autoFocus
        />
        <TextBox
          label="Link url"
          placeholder="Link url"
          name="url"
          onChange={setData}
          value={data.url}
          required
        />
        <TextBox
          label="Link description"
          placeholder="Link description"
          name="description"
          onChange={setData}
          value={data.description}
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
        <FormField required>
          <label htmlFor="favorite">Favorite</label>
          <input
            type="checkbox"
            onChange={handleOnCheck}
            checked={data.favorite}
            id="favorite"
          />
        </FormField>
      </BackToDashboard>
    </FormLayout>
  );
}
