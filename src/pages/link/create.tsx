import Checkbox from 'components/Checkbox';
import FormLayout from 'components/FormLayout';
import PageTransition from 'components/PageTransition';
import Selector from 'components/Selector';
import TextBox from 'components/TextBox';
import PATHS from 'constants/paths';
import useAutoFocus from 'hooks/useAutoFocus';
import { getServerSideTranslation } from 'i18n';
import getUserCategories from 'lib/category/getUserCategories';
import { makeRequest } from 'lib/request';
import { isValidHttpUrl } from 'lib/url';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { FormEvent, useMemo, useState } from 'react';
import styles from 'styles/form.module.scss';
import { CategoryWithLinks, LinkWithCategory } from 'types';
import { withAuthentication } from 'utils/session';

export default function PageCreateLink({
  categories,
}: Readonly<{
  categories: CategoryWithLinks[];
}>) {
  const { t } = useTranslation();
  const router = useRouter();
  const autoFocusRef = useAutoFocus();
  const categoryIdQuery = router.query?.categoryId as string;

  const [name, setName] = useState<LinkWithCategory['name']>('');
  const [url, setUrl] = useState<LinkWithCategory['url']>('');
  const [description, setDescription] =
    useState<LinkWithCategory['description']>('');
  const [favorite, setFavorite] = useState<LinkWithCategory['favorite']>(false);
  const [categoryId, setCategoryId] = useState<
    LinkWithCategory['category']['id']
  >(Number(categoryIdQuery) || categories?.[0].id || null);

  const [error, setError] = useState<string>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const canSubmit = useMemo<boolean>(
    () =>
      name !== '' &&
      isValidHttpUrl(url) &&
      favorite !== null &&
      categoryId !== null &&
      !submitted,
    [name, url, favorite, categoryId, submitted],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitted(true);

    makeRequest({
      url: PATHS.API.LINK,
      method: 'POST',
      body: { name, url, description, favorite, categoryId },
    })
      .then((data) =>
        router.push(`${PATHS.APP}?categoryId=${data?.categoryId}`),
      )
      .catch(setError)
      .finally(() => setSubmitted(false));
  };

  return (
    <PageTransition className={styles['form-container']}>
      <FormLayout
        title={t('common:link.create')}
        categoryId={categoryIdQuery}
        errorMessage={error}
        canSubmit={canSubmit}
        handleSubmit={handleSubmit}
      >
        <TextBox
          name='name'
          label={t('common:link.name')}
          onChangeCallback={setName}
          value={name}
          fieldClass={styles['input-field']}
          placeholder={t('common:link.name')}
          innerRef={autoFocusRef}
          required
        />
        <TextBox
          name='url'
          label={t('common:link.link')}
          onChangeCallback={setUrl}
          value={url}
          fieldClass={styles['input-field']}
          placeholder='https://www.example.com/'
          required
        />
        <TextBox
          name='description'
          label={t('common:link.description')}
          onChangeCallback={setDescription}
          value={description}
          fieldClass={styles['input-field']}
          placeholder={t('common:link.description')}
        />
        <Selector
          name='category'
          label={t('common:category.category')}
          value={categoryId}
          onChangeCallback={(value: number) => setCategoryId(value)}
          options={categories.map(({ id, name }) => ({
            label: name,
            value: id,
          }))}
          required
        />
        <Checkbox
          name='favorite'
          isChecked={favorite}
          onChangeCallback={setFavorite}
          label={t('common:favorite')}
        />
      </FormLayout>
    </PageTransition>
  );
}

export const getServerSideProps = withAuthentication(
  async ({ session, user, locale }) => {
    const categories = await getUserCategories(user);
    if (categories.length === 0) {
      return {
        redirect: {
          destination: PATHS.APP,
        },
      };
    }

    return {
      props: {
        session,
        categories: JSON.parse(JSON.stringify(categories)),
        ...(await getServerSideTranslation(locale)),
      },
    };
  },
);
