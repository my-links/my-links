import FormLayout from "components/FormLayout";
import PageTransition from "components/PageTransition";
import TextBox from "components/TextBox";
import PATHS from "constants/paths";
import useAutoFocus from "hooks/useAutoFocus";
import { getServerSideTranslation } from "i18n";
import getUserCategoriesCount from "lib/category/getUserCategoriesCount";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { FormEvent, useMemo, useState } from "react";
import styles from "styles/form.module.scss";
import { withAuthentication } from "utils/session";
import { makeRequest } from "lib/request";

export default function PageCreateCategory({
  categoriesCount
}: {
  categoriesCount: number;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const autoFocusRef = useAutoFocus();
  const info = useRouter().query?.info as string;

  const [name, setName] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const canSubmit = useMemo<boolean>(
    () => name.length !== 0 && !submitted,
    [name.length, submitted]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitted(true);

    makeRequest({
      url: PATHS.API.CATEGORY,
      method: "POST",
      body: { name }
    })
      .then((data) => router.push(`${PATHS.HOME}?categoryId=${data?.categoryId}`))
      .catch(setError)
      .finally(() => setSubmitted(false));
  };

  return (
    <PageTransition className={styles["form-container"]}>
      <FormLayout
        title={t("common:category.create")}
        errorMessage={error}
        infoMessage={info}
        canSubmit={canSubmit}
        handleSubmit={handleSubmit}
        disableHomeLink={categoriesCount === 0}
      >
        <TextBox
          name="name"
          label={t("common:category.name")}
          onChangeCallback={(value) => setName(value)}
          value={name}
          fieldClass={styles["input-field"]}
          placeholder={t("common:category.name")}
          innerRef={autoFocusRef}
        />
      </FormLayout>
    </PageTransition>
  );
}

export const getServerSideProps = withAuthentication(
  async ({ session, user, locale }) => {
    const categoriesCount = await getUserCategoriesCount(user);

    return {
      props: {
        session,
        categoriesCount,
        ...(await getServerSideTranslation(locale))
      }
    };
  }
);
