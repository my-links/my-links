import Checkbox from "components/Checkbox";
import FormLayout from "components/FormLayout";
import PageTransition from "components/PageTransition";
import Selector from "components/Selector";
import TextBox from "components/TextBox";
import PATHS from "constants/paths";
import useAutoFocus from "hooks/useAutoFocus";
import { getServerSideTranslation } from "i18n";
import getUserCategories from "lib/category/getUserCategories";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { FormEvent, useMemo, useState } from "react";
import styles from "styles/form.module.scss";
import { Category, Link } from "types";
import { IsValidURL } from "utils/front";
import { withAuthentication } from "utils/session";
import { makeRequest } from "lib/request";

export default function PageCreateLink({
  categories
}: {
  categories: Category[];
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const autoFocusRef = useAutoFocus();
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitted(true);

    makeRequest({
      url: PATHS.API.LINK,
      method: "POST",
      body: { name, url, favorite, categoryId }
    })
      .then((data) => router.push(`${PATHS.HOME}?categoryId=${data?.categoryId}`))
      .catch(setError)
      .finally(() => setSubmitted(false));
  };

  return (
    <PageTransition className={styles["form-container"]}>
      <FormLayout
        title={t("common:link.create")}
        categoryId={categoryIdQuery}
        errorMessage={error}
        canSubmit={canSubmit}
        handleSubmit={handleSubmit}
      >
        <TextBox
          name="name"
          label={t("common:link.name")}
          onChangeCallback={(value) => setName(value)}
          value={name}
          fieldClass={styles["input-field"]}
          placeholder={t("common:link.name")}
          innerRef={autoFocusRef}
        />
        <TextBox
          name="url"
          label={t("common:link.link")}
          onChangeCallback={(value) => setUrl(value)}
          value={url}
          fieldClass={styles["input-field"]}
          placeholder="https://www.example.com/"
        />
        <Selector
          name="category"
          label={t("common:category.category")}
          value={categoryId}
          onChangeCallback={(value: number) => setCategoryId(value)}
          options={categories.map(({ id, name }) => ({
            label: name,
            value: id
          }))}
        />
        <Checkbox
          name="favorite"
          isChecked={favorite}
          onChangeCallback={(value) => setFavorite(value)}
          label={t("common:favorite")}
        />
      </FormLayout>
    </PageTransition>
  );
}

export const getServerSideProps = withAuthentication(
  async ({ session, user, locale }) => {
    const categories = await getUserCategories(user);
    if (categories.length === 0) {
      return {
        redirect: {
          destination: PATHS.HOME
        }
      };
    }

    return {
      props: {
        session,
        categories: JSON.parse(JSON.stringify(categories)),
        ...(await getServerSideTranslation(locale))
      }
    };
  }
);
