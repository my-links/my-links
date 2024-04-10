import Checkbox from 'components/Checkbox';
import FormLayout from 'components/FormLayout';
import PageTransition from 'components/PageTransition';
import Selector from 'components/Selector';
import TextBox from 'components/TextBox';
import PATHS from 'constants/paths';
import useAutoFocus from 'hooks/useAutoFocus';
import { getServerSideTranslation } from 'i18n';
import getUserCategories from 'lib/category/getUserCategories';
import getUserLink from 'lib/link/getUserLink';
import { makeRequest } from 'lib/request';
import { isValidHttpUrl } from 'lib/url';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { FormEvent, useMemo, useState } from 'react';
import styles from 'styles/form.module.scss';
import { CategoryWithLinks, LinkWithCategory } from 'types';
import { withAuthentication } from 'utils/session';

export default function PageEditLink({
  link,
  categories,
}: Readonly<{
  link: LinkWithCategory;
  categories: CategoryWithLinks[];
}>) {
  const { t } = useTranslation();
  const router = useRouter();
  const autoFocusRef = useAutoFocus();

  const [name, setName] = useState<string>(link.name);
  const [url, setUrl] = useState<string>(link.url);
  const [description, setDescription] = useState<string>(link.description);
  const [favorite, setFavorite] = useState<boolean>(link.favorite);
  const [categoryId, setCategoryId] = useState<number | null>(
    link.category?.id || null,
  );

  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const canSubmit = useMemo<boolean>(() => {
    const isFormEdited =
      name !== link.name ||
      url !== link.url ||
      description !== link.description ||
      favorite !== link.favorite ||
      categoryId !== link.category.id;
    const isFormValid =
      name !== '' &&
      isValidHttpUrl(url) &&
      favorite !== null &&
      categoryId !== null;
    return isFormEdited && isFormValid && !submitted;
  }, [categoryId, description, favorite, link, name, submitted, url]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitted(true);

    makeRequest({
      url: `${PATHS.API.LINK}/${link.id}`,
      method: 'PUT',
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
        title={t('common:link.edit')}
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
          placeholder={`${t('common:link.name')} : ${link.name}`}
          innerRef={autoFocusRef}
          required
        />
        <TextBox
          name='url'
          label={t('common:link.link')}
          onChangeCallback={setUrl}
          value={url}
          fieldClass={styles['input-field']}
          placeholder='https://example.com/'
          required
        />
        <TextBox
          name='description'
          label={t('common:link.description')}
          onChangeCallback={setDescription}
          value={description}
          fieldClass={styles['input-field']}
          placeholder={`${t('common:link.description')}${
            ` : ${link.description}` ?? ''
          }`}
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
  async ({ query, session, user, locale }) => {
    const { lid } = query;

    const categories = await getUserCategories(user);
    const link = await getUserLink(user, Number(lid));
    if (!link) {
      return {
        redirect: {
          destination: PATHS.APP,
        },
      };
    }

    return {
      props: {
        session,
        link: JSON.parse(JSON.stringify(link)),
        categories: JSON.parse(JSON.stringify(categories)),
        ...(await getServerSideTranslation(locale)),
      },
    };
  },
);
