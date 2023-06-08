import axios from "axios";
import { useRouter } from "next/router";
import nProgress from "nprogress";
import { useMemo, useState } from "react";

import Checkbox from "components/Checkbox";
import FormLayout from "components/FormLayout";
import PageTransition from "components/PageTransition";
import Selector from "components/Selector";
import TextBox from "components/TextBox";

import PATHS from "constants/paths";
import useAutoFocus from "hooks/useAutoFocus";
import getUserCategories from "lib/category/getUserCategories";
import getUser from "lib/user/getUser";
import { Category, Link } from "types";
import { HandleAxiosError, IsValidURL } from "utils/front";
import { getSession } from "utils/session";

import styles from "styles/form.module.scss";

function CreateLink({ categories }: { categories: Category[] }) {
  const autoFocusRef = useAutoFocus();
  const router = useRouter();
  const categoryIdQuery = router.query?.categoryId as string;

  const [name, setName] = useState<Link["name"]>("");
  const [url, setUrl] = useState<Link["url"]>("");
  const [favorite, setFavorite] = useState<Link["favorite"]>(false);
  const [categoryId, setCategoryId] = useState<Link["category"]["id"]>(
    Number(categoryIdQuery) || categories?.[0].id || null
  );

  const [error, setError] = useState<string>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const canSubmit = useMemo<boolean>(
    () =>
      name !== "" &&
      IsValidURL(url) &&
      favorite !== null &&
      categoryId !== null &&
      !submitted,
    [name, url, favorite, categoryId, submitted]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitted(true);
    nProgress.start();

    try {
      const payload = { name, url, favorite, categoryId };
      const { data } = await axios.post(PATHS.API.LINK, payload);
      router.push(`${PATHS.HOME}?categoryId=${data?.categoryId}`);
      setSubmitted(true);
    } catch (error) {
      setError(HandleAxiosError(error));
    } finally {
      setSubmitted(true);
      nProgress.done();
    }
  };

  return (
    <PageTransition className={styles["form-container"]}>
      <FormLayout
        title="Créer un lien"
        categoryId={categoryIdQuery}
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
          placeholder="Nom du lien"
          innerRef={autoFocusRef}
        />
        <TextBox
          name="url"
          label="URL"
          onChangeCallback={(value) => setUrl(value)}
          value={url}
          fieldClass={styles["input-field"]}
          placeholder="https://www.example.org/"
        />
        <Selector
          name="category"
          label="Catégorie"
          value={categoryId}
          onChangeCallback={(value: number) => setCategoryId(value)}
          options={categories.map(({ id, name }) => ({
            label: name,
            value: id,
          }))}
        />
        <Checkbox
          name="favorite"
          isChecked={favorite}
          onChangeCallback={(value) => setFavorite(value)}
          label="Favoris"
        />
      </FormLayout>
    </PageTransition>
  );
}

CreateLink.authRequired = true;
export default CreateLink;

export async function getServerSideProps({ req, res }) {
  const session = await getSession(req, res);
  const user = await getUser(session);
  if (!user) {
    return {
      redirect: {
        destination: PATHS.HOME,
      },
    };
  }

  const categories = await getUserCategories(user);
  if (categories.length === 0) {
    return {
      redirect: {
        destination: PATHS.HOME,
      },
    };
  }

  return {
    props: {
      categories: JSON.parse(JSON.stringify(categories)),
    },
  };
}
