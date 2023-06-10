import axios from "axios";
import { useRouter } from "next/router";
import nProgress from "nprogress";
import { useMemo, useState } from "react";

import Checkbox from "components/Checkbox";
import FormLayout from "components/FormLayout";
import PageTransition from "components/PageTransition";
import TextBox from "components/TextBox";

import PATHS from "constants/paths";
import getUserLink from "lib/link/getUserLink";
import { Link } from "types";
import { HandleAxiosError } from "utils/front";
import { withAuthentication } from "utils/session";

import styles from "styles/form.module.scss";

export default function PageRemoveLink({ link }: { link: Link }) {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const canSubmit = useMemo<boolean>(
    () => confirmDelete && !submitted,
    [confirmDelete, submitted]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    nProgress.start();

    try {
      const { data } = await axios.delete(`${PATHS.API.LINK}/${link.id}`);
      router.push(`${PATHS.HOME}?categoryId=${data?.categoryId}`);
      setSubmitted(true);
    } catch (error) {
      setError(HandleAxiosError(error));
    } finally {
      nProgress.done();
    }
  };

  return (
    <PageTransition className={styles["form-container"]}>
      <FormLayout
        title="Supprimer un lien"
        categoryId={link.category.id.toString()}
        errorMessage={error}
        canSubmit={canSubmit}
        handleSubmit={handleSubmit}
        classBtnConfirm="red-btn"
        textBtnConfirm="Supprimer"
      >
        <TextBox
          name="name"
          label="Nom"
          value={link.name}
          fieldClass={styles["input-field"]}
          disabled={true}
        />
        <TextBox
          name="url"
          label="URL"
          value={link.url}
          fieldClass={styles["input-field"]}
          disabled={true}
        />
        <TextBox
          name="category"
          label="Catégorie"
          value={link.category.name}
          fieldClass={styles["input-field"]}
          disabled={true}
        />
        <Checkbox
          name="favorite"
          label="Favoris"
          isChecked={link.favorite}
          disabled={true}
        />
        <Checkbox
          name="confirm-delete"
          label="Confirmer la suppression ?"
          isChecked={confirmDelete}
          onChangeCallback={(checked) => setConfirmDelete(checked)}
        />
      </FormLayout>
    </PageTransition>
  );
}

export const getServerSideProps = withAuthentication(
  async ({ query, session, user }) => {
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
      },
    };
  }
);
