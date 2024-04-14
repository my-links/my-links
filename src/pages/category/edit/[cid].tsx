import { Visibility } from '@prisma/client';
import Checkbox from 'components/Checkbox';
import FormLayout from 'components/FormLayout';
import PageTransition from 'components/PageTransition';
import TextBox from 'components/TextBox';
import PATHS from 'constants/paths';
import useAutoFocus from 'hooks/useAutoFocus';
import { getServerSideTranslation } from 'i18n';
import getUserCategory from 'lib/category/getUserCategory';
import { makeRequest } from 'lib/request';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { FormEvent, useMemo, useState } from 'react';
import styles from 'styles/form.module.scss';
import { CategoryWithLinks } from 'types';
import { withAuthentication } from 'utils/session';

export default function PageEditCategory({
  category,
}: Readonly<{
  category: CategoryWithLinks;
}>) {
  const { t } = useTranslation();
  const router = useRouter();
  const autoFocusRef = useAutoFocus();

  const [name, setName] = useState<string>(category.name);
  const [description, setDescription] = useState<string>(category.description);
  const [visibility, setVisibility] = useState<Visibility>(category.visibility);

  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const canSubmit = useMemo<boolean>(() => {
    const isFormEdited =
      name !== category.name ||
      description !== category.description ||
      visibility !== category.visibility;
    const isFormValid = name !== '';
    return isFormEdited && isFormValid && !submitted;
  }, [
    category.description,
    category.name,
    category.visibility,
    description,
    name,
    submitted,
    visibility,
  ]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitted(true);

    makeRequest({
      url: `${PATHS.API.CATEGORY}/${category.id}`,
      method: 'PUT',
      body: { name, description, visibility, nextId: category.nextId },
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
        title={t('common:category.edit')}
        errorMessage={error}
        canSubmit={canSubmit}
        handleSubmit={handleSubmit}
      >
        <TextBox
          name='name'
          label={t('common:category.name')}
          onChangeCallback={setName}
          value={name}
          fieldClass={styles['input-field']}
          placeholder={`${t('common:category.name')} : ${category.name}`}
          innerRef={autoFocusRef}
          required
        />
        <TextBox
          name='description'
          label={t('common:category.description')}
          onChangeCallback={setDescription}
          value={description}
          fieldClass={styles['input-field']}
          placeholder={t('common:category.description')}
        />
        <Checkbox
          name='visibility'
          isChecked={visibility === Visibility.public}
          onChangeCallback={(value) =>
            setVisibility(!!value ? Visibility.public : Visibility.private)
          }
          label={t('common:category.visibility')}
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
          destination: PATHS.APP,
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
