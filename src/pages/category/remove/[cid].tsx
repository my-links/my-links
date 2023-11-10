import axios from "axios";
import Checkbox from "components/Checkbox";
import FormLayout from "components/FormLayout";
import PageTransition from "components/PageTransition";
import TextBox from "components/TextBox";
import PATHS from "constants/paths";
import { getServerSideTranslation } from "i18n";
import getUserCategory from "lib/category/getUserCategory";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import nProgress from "nprogress";
import { useEffect, useMemo, useState } from "react";
import styles from "styles/form.module.scss";
import { Category } from "types";
import { HandleAxiosError } from "utils/front";
import { withAuthentication } from "utils/session";

export default function PageRemoveCategory({
  category,
}: {
  category: Category;
}) {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [error, setError] = useState<string>(null);
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
      await axios.delete(`${PATHS.API.CATEGORY}/${category.id}`);
      router.push(PATHS.HOME);
      setSubmitted(true);
    } catch (error) {
      setError(HandleAxiosError(error));
      setSubmitted(false);
    } finally {
      nProgress.done();
    }
  };

  useEffect(() => {
    setError(
      category.links.length > 0 ? t("common:category.remove-description") : null
    );
  }, [category.links.length, i18n.language, t]);

  return (
    <PageTransition className={styles["form-container"]}>
      <FormLayout
        title={t("common:category.remove")}
        categoryId={category.id.toString()}
        errorMessage={error}
        canSubmit={canSubmit}
        handleSubmit={handleSubmit}
        classBtnConfirm="red-btn"
        textBtnConfirm="Supprimer"
      >
        <TextBox
          name="name"
          label={t("common:category.name")}
          value={category.name}
          fieldClass={styles["input-field"]}
          disabled={true}
        />
        <Checkbox
          name="confirm-delete"
          label={t("common:category.remove-confirm")}
          isChecked={confirmDelete}
          disabled={!!error}
          onChangeCallback={(checked) => setConfirmDelete(checked)}
        />
      </FormLayout>
    </PageTransition>
  );
}

export const getServerSideProps = withAuthentication(
  async ({ query, session, user, locale }) => {
    const { cid } = query;

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
        session,
        category: JSON.parse(JSON.stringify(category)),
        ...(await getServerSideTranslation(locale)),
      },
    };
  }
);
