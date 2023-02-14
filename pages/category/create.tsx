import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/router";
import nProgress from "nprogress";
import { FormEvent, useMemo, useState } from "react";

import FormLayout from "../../components/FormLayout";
import TextBox from "../../components/TextBox";

import { Category } from "../../types";
import { HandleAxiosError } from "../../utils/front";
import { trpc } from "../../utils/trpc";

import styles from "../../styles/create.module.scss";

function CreateCategory() {
  const hello = trpc.hello.useQuery({ text: "client" });
  const info = useRouter().query?.info as string;
  const [name, setName] = useState<string>("");

  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false);

  const canSubmit = useMemo<boolean>(
    () => name.length !== 0 && !loading,
    [loading, name.length]
  );
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(undefined);
    setError(undefined);
    setLoading(true);
    nProgress.start();

    try {
      const payload = { name };
      const { data }: AxiosResponse<{ success: string; category: Category }> =
        await axios.post("/api/category/create", payload);

      console.log(data);
      setSuccess(data.success);
    } catch (error) {
      setError(HandleAxiosError(error));
    } finally {
      setLoading(false);
      nProgress.done();
    }
  };

  return (
    <FormLayout
      title="Créer une catégorie"
      errorMessage={error}
      successMessage={success}
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
      />
      {JSON.stringify(hello)}
    </FormLayout>
  );
}

CreateCategory.authRequired = true;
export default CreateCategory;
