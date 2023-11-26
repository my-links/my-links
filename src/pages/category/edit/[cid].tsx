import FormLayout from 'components/FormLayout';
import PageTransition from 'components/PageTransition';
import TextBox from 'components/TextBox';
import PATHS from 'constants/paths';
import useAutoFocus from 'hooks/useAutoFocus';
import { getServerSideTranslation } from 'i18n';
import getUserCategory from 'lib/category/getUserCategory';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { FormEvent, useMemo, useState } from 'react';
import styles from 'styles/form.module.scss';
import { Category } from 'types';
import { withAuthentication } from 'utils/session';
import { makeRequest } from 'lib/request';

export default function PageEditCategory({ category }: { category: Category }) {
  const { t } = useTranslation();
  const router = useRouter();
  const autoFocusRef = useAutoFocus();

  const [name, setName] = useState<string>(category.name);

  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const canSubmit = useMemo<boolean>(
    () => name !== category.name && name !== '' && !submitted,
    [category.name, name, submitted],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitted(true);

    makeRequest({
      url: `${PATHS.API.CATEGORY}/${category.id}`,
      method: 'PUT',
      body: { name },
    })
      .then((data) =>
        router.push(`${PATHS.HOME}?categoryId=${data?.categoryId}`),
      )
      .catch(setError)
      .finally(() => setSubmitted(false));
  };

  return (
    <PageTransition className={styles['form-container']}>
      <FormLayout
        title={t('common:category.edit')}
        errorMessage={error}
        canSubmit={canSubmit}
        handleSubmit={handleSubmit}
      >
        <TextBox
          name='name'
          label={t('common:category.name')}
          onChangeCallback={(value) => setName(value)}
          value={name}
          fieldClass={styles['input-field']}
          placeholder={`${t('common:category.name')} : ${category.name}`}
          innerRef={autoFocusRef}
        />
      </FormLayout>
    </PageTransition>
  );
}

export const getServerSideProps = withAuthentication(
  async ({ query, session, user, locale }) => {
    const { cid } = query;

    const category = await getUserCategory(user, Number(cid));
    if (!category) {
      return {
        redirect: {
          destination: PATHS.HOME,
        },
      };
    }

    return {
      props: {
        session,
        category: JSON.parse(JSON.stringify(category)),
        ...(await getServerSideTranslation(locale)),
      },
    };
  },
);
