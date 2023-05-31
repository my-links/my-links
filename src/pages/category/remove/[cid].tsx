import axios from "axios";
import { useRouter } from "next/router";
import nProgress from "nprogress";
import { useMemo, useState } from "react";

import Checkbox from "components/Checkbox";
import FormLayout from "components/FormLayout";
import PageTransition from "components/PageTransition";
import TextBox from "components/TextBox";

import { Category } from "types";
import { BuildCategory, HandleAxiosError } from "utils/front";
import prisma from "utils/prisma";

import styles from "styles/create.module.scss";

function RemoveCategory({ category }: { category: Category }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(
    category.links.length > 0
      ? "Vous devez supprimer tous les liens de cette catégorie avant de pouvoir supprimer cette catégorie"
      : null
  );
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const canSubmit = useMemo<boolean>(
    () => category.links.length === 0 && confirmDelete && !submitted,
    [category.links.length, confirmDelete, submitted]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitted(true);
    nProgress.start();

    try {
      await axios.delete(`/api/category/remove/${category.id}`);
      router.push("/");
      setSubmitted(true);
    } catch (error) {
      setError(HandleAxiosError(error));
      setSubmitted(false);
    } finally {
      nProgress.done();
    }
  };

  return (
    <PageTransition className="page-category-remove">
      <FormLayout
        title="Supprimer une catégorie"
        categoryId={category.id.toString()}
        errorMessage={error}
        canSubmit={canSubmit}
        handleSubmit={handleSubmit}
        classBtnConfirm="red-btn"
        textBtnConfirm="Supprimer"
      >
        <TextBox
          name="name"
          label="Nom"
          value={category.name}
          fieldClass={styles["input-field"]}
          disabled={true}
        />
        <Checkbox
          name="confirm-delete"
          label="Confirmer la suppression ?"
          isChecked={confirmDelete}
          disabled={!!error}
          onChangeCallback={(checked) => setConfirmDelete(checked)}
        />
      </FormLayout>
    </PageTransition>
  );
}

RemoveCategory.authRequired = true;
export default RemoveCategory;

export async function getServerSideProps({ query }) {
  const { cid } = query;
  const categoryDB = await prisma.category.findFirst({
    where: { id: Number(cid) },
    include: { links: true, author: true },
  });

  if (!categoryDB) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  const category = BuildCategory(categoryDB);
  return {
    props: {
      category: JSON.parse(JSON.stringify(category)),
    },
  };
}
