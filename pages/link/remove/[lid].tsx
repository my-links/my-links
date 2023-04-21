import axios from "axios";
import { useRouter } from "next/router";
import nProgress from "nprogress";
import { useMemo, useState } from "react";

import Checkbox from "../../../components/Checkbox";
import FormLayout from "../../../components/FormLayout";
import TextBox from "../../../components/TextBox";

import { Link } from "../../../types";
import { prisma } from "../../../utils/back";
import { BuildLink, HandleAxiosError } from "../../../utils/front";

import styles from "../../../styles/create.module.scss";

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
      const { data } = await axios.delete(`/api/link/remove/${link.id}`);
      router.push(`/?categoryId=${data?.categoryId}`);
      setSubmitted(true);
    } catch (error) {
      setError(HandleAxiosError(error));
    } finally {
      nProgress.done();
    }
  };

  return (
    <>
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
    </>
  );
}

RemoveLink.authRequired = true;
export default RemoveLink;

export async function getServerSideProps({ query }) {
  const { lid } = query;
  const linkDB = await prisma.link.findFirst({
    where: { id: Number(lid) },
    include: { category: true },
  });

  if (!linkDB) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  const link = BuildLink(linkDB, {
    categoryId: linkDB.categoryId,
    categoryName: linkDB.category.name,
  });
  return {
    props: {
      link: JSON.parse(JSON.stringify(link)),
    },
  };
}
