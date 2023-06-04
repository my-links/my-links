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
import getUser from "lib/user/getUser";
import { Link } from "types";
import { HandleAxiosError } from "utils/front";
import { getSession } from "utils/session";

import styles from "styles/create.module.scss";

function RemoveLink({ link }: { link: Link }) {
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
    <PageTransition className="page-link-remove">
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

RemoveLink.authRequired = true;
export default RemoveLink;

export async function getServerSideProps({ req, res, query }) {
  const { lid } = query;

  const session = await getSession(req, res);
  const user = await getUser(session);
  if (!user) {
    return {
      redirect: {
        destination: PATHS.HOME,
      },
    };
  }

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
      link: JSON.parse(JSON.stringify(link)),
    },
  };
}
