import axios from "axios";
import { useRouter } from "next/router";
import nProgress from "nprogress";
import { useMemo, useState } from "react";

import FormLayout from "components/FormLayout";
import PageTransition from "components/PageTransition";
import TextBox from "components/TextBox";

import useAutoFocus from "hooks/useAutoFocus";
import { Category } from "types";
import { BuildCategory, HandleAxiosError } from "utils/front";
import prisma from "utils/prisma";

import styles from "styles/create.module.scss";

function EditCategory({ category }: { category: Category }) {
  const autoFocusRef = useAutoFocus();
  const router = useRouter();

  const [name, setName] = useState<string>(category.name);

  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const canSubmit = useMemo<boolean>(
    () => name !== category.name && name !== "" && !submitted,
    [category.name, name, submitted]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitted(true);
    nProgress.start();

    try {
      const payload = { name };
      const { data } = await axios.put(
        `/api/category/edit/${category.id}`,
        payload
      );
      router.push(`/?categoryId=${data?.categoryId}`);
      setSubmitted(true);
    } catch (error) {
      setError(HandleAxiosError(error));
      setSubmitted(false);
    } finally {
      nProgress.done();
    }
  };

  return (
    <PageTransition className="page-category-edit">
      <FormLayout
        title="Modifier une catégorie"
        errorMessage={error}
        canSubmit={canSubmit}
        handleSubmit={handleSubmit}
      >
        <TextBox
          name="name"
          label="Nom"
          onChangeCallback={(value) => setName(value)}
          value={name}
          fieldClass={styles["input-field"]}
          placeholder={`Nom original : ${category.name}`}
          innerRef={autoFocusRef}
        />
      </FormLayout>
    </PageTransition>
  );
}

EditCategory.authRequired = true;
export default EditCategory;

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
