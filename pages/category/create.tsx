import axios from "axios";
import { useRouter } from "next/router";
import nProgress from "nprogress";
import { useMemo, useState } from "react";

import useAutoFocus from "../../hooks/useAutoFocus";

import FormLayout from "../../components/FormLayout";
import TextBox from "../../components/TextBox";

import { redirectWithoutClientCache } from "../../utils/client";
import { HandleAxiosError } from "../../utils/front";

import styles from "../../styles/create.module.scss";

function CreateCategory() {
  const autoFocusRef = useAutoFocus();
  const router = useRouter();
  const info = useRouter().query?.info as string;

  const [name, setName] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const canSubmit = useMemo<boolean>(
    () => name.length !== 0 && !submitted,
    [name.length, submitted]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitted(true);
    nProgress.start();

    try {
      const { data } = await axios.post("/api/category/create", { name });
      redirectWithoutClientCache(router, "");
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
    <>
      <FormLayout
        title="Créer une catégorie"
        errorMessage={error}
        infoMessage={info}
        canSubmit={canSubmit}
        handleSubmit={handleSubmit}
      >
        <TextBox
          name="name"
          label="Nom de la catégorie"
          onChangeCallback={(value) => setName(value)}
          value={name}
          fieldClass={styles["input-field"]}
          placeholder="Nom..."
          innerRef={autoFocusRef}
        />
      </FormLayout>
    </>
  );
}

CreateCategory.authRequired = true;
export default CreateCategory;
