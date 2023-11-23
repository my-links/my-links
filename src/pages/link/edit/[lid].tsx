import Checkbox from "components/Checkbox";
import FormLayout from "components/FormLayout";
import PageTransition from "components/PageTransition";
import Selector from "components/Selector";
import TextBox from "components/TextBox";
import PATHS from "constants/paths";
import useAutoFocus from "hooks/useAutoFocus";
import { getServerSideTranslation } from "i18n";
import getUserCategories from "lib/category/getUserCategories";
import getUserLink from "lib/link/getUserLink";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { FormEvent, useMemo, useState } from "react";
import styles from "styles/form.module.scss";
import { Category, Link } from "types";
import { isValidHttpUrl } from "lib/url";
import { withAuthentication } from "utils/session";
import { makeRequest } from "lib/request";

export default function PageEditLink({
  link,
  categories,
}: {
  link: Link;
  categories: Category[];
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const autoFocusRef = useAutoFocus();

  const [name, setName] = useState<string>(link.name);
  const [url, setUrl] = useState<string>(link.url);
  const [favorite, setFavorite] = useState<boolean>(link.favorite);
  const [categoryId, setCategoryId] = useState<number | null>(
    link.category?.id || null,
  );

  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const canSubmit = useMemo<boolean>(() => {
    const isFormEdited =
      name !== link.name ||
      url !== link.url ||
      favorite !== link.favorite ||
      categoryId !== link.category.id;
    const isFormValid =
      name !== "" &&
      isValidHttpUrl(url) &&
      favorite !== null &&
      categoryId !== null;
    return isFormEdited && isFormValid && !submitted;
  }, [
    categoryId,
    favorite,
    link.category.id,
    link.favorite,
    link.name,
    link.url,
    name,
    submitted,
    url,
  ]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitted(true);

    makeRequest({
      url: `${PATHS.API.LINK}/${link.id}`,
      method: "PUT",
      body: { name, url, favorite, categoryId },
    })
      .then((data) =>
        router.push(`${PATHS.HOME}?categoryId=${data?.categoryId}`),
      )
      .catch(setError)
      .finally(() => setSubmitted(false));
  };

  return (
    <PageTransition className={styles["form-container"]}>
      <FormLayout
        title={t("common:link.edit")}
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
          placeholder={`${t("common:link.name")} : ${link.name}`}
          innerRef={autoFocusRef}
        />
        <TextBox
          name="url"
          label={t("common:link.link")}
          onChangeCallback={(value) => setUrl(value)}
          value={url}
          fieldClass={styles["input-field"]}
          placeholder="https://example.com/"
        />
        <Selector
          name="category"
          label={t("common:category.category")}
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
          label={t("common:favorite")}
        />
      </FormLayout>
    </PageTransition>
  );
}

export const getServerSideProps = withAuthentication(
  async ({ query, session, user, locale }) => {
    const { lid } = query;

    const categories = await getUserCategories(user);
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
        categories: JSON.parse(JSON.stringify(categories)),
        ...(await getServerSideTranslation(locale)),
      },
    };
  },
);
