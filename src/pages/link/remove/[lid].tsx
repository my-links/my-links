import Checkbox from 'components/Checkbox';
import FormLayout from 'components/FormLayout';
import PageTransition from 'components/PageTransition';
import TextBox from 'components/TextBox';
import PATHS from 'constants/paths';
import { getServerSideTranslation } from 'i18n';
import getUserLink from 'lib/link/getUserLink';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { FormEvent, useMemo, useState } from 'react';
import styles from 'styles/form.module.scss';
import { Link } from 'types';
import { withAuthentication } from 'utils/session';
import { makeRequest } from 'lib/request';

export default function PageRemoveLink({ link }: { link: Link }) {
  const { t } = useTranslation();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const canSubmit = useMemo<boolean>(
    () => confirmDelete && !submitted,
    [confirmDelete, submitted],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitted(true);

    makeRequest({
      url: `${PATHS.API.LINK}/${link.id}`,
      method: 'DELETE',
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
        title={t('common:link.remove')}
        categoryId={link.category.id.toString()}
        errorMessage={error}
        canSubmit={canSubmit}
        handleSubmit={handleSubmit}
        classBtnConfirm='red-btn'
        textBtnConfirm='Supprimer'
      >
        <TextBox
          name='name'
          label={t('common:link.name')}
          value={link.name}
          fieldClass={styles['input-field']}
          disabled={true}
        />
        <TextBox
          name='url'
          label={t('common:link.link')}
          value={link.url}
          fieldClass={styles['input-field']}
          disabled={true}
        />
        <TextBox
          name='category'
          label={t('common:category.category')}
          value={link.category.name}
          fieldClass={styles['input-field']}
          disabled={true}
        />
        <Checkbox
          name='favorite'
          label={t('common:favorite')}
          isChecked={link.favorite}
          disabled={true}
        />
        <Checkbox
          name='confirm-delete'
          label={t('common:category.remove-confirm')}
          isChecked={confirmDelete}
          onChangeCallback={(checked) => setConfirmDelete(checked)}
        />
      </FormLayout>
    </PageTransition>
  );
}

export const getServerSideProps = withAuthentication(
  async ({ query, session, user, locale }) => {
    const { lid } = query;

    const link = await getUserLink(user, Number(lid));
    if (!link) {
      return {
        redirect: {
          destination: PATHS.HOME,
        },
      };
    }

    return {
      props: {
        session,
        link: JSON.parse(JSON.stringify(link)),
        ...(await getServerSideTranslation(locale)),
      },
    };
  },
);
