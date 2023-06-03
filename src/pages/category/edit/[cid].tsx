import axios from "axios";
import { useRouter } from "next/router";
import nProgress from "nprogress";
import { useMemo, useState } from "react";

import FormLayout from "components/FormLayout";
import PageTransition from "components/PageTransition";
import TextBox from "components/TextBox";

import PATHS from "constants/paths";
import useAutoFocus from "hooks/useAutoFocus";
import getUserCategory from "lib/category/getUserCategory";
import getUser from "lib/user/getUser";
import { Category } from "types";
import { HandleAxiosError } from "utils/front";
import { getSession } from "utils/session";

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
      const { data } = await axios.put(`${PATHS.API.CATEGORY}/${category.id}`, {
        name,
      });
      router.push(`${PATHS.HOME}?categoryId=${data?.categoryId}`);
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

export async function getServerSideProps({ req, res, query }) {
  const { cid } = query;

  const session = await getSession(req, res);
  const user = await getUser(session);

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
      category: JSON.parse(JSON.stringify(category)),
    },
  };
}
