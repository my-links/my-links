import { NextSeo } from "next-seo";
import Link from "next/link";

import MessageManager from "./MessageManager/MessageManager";

import styles from "../styles/create.module.scss";

interface FormProps {
  title: string;

  categoryId?: string;

  errorMessage?: string;
  successMessage?: string;
  infoMessage?: string;

  canSubmit: boolean;
  handleSubmit: (event) => void;

  textBtnConfirm?: string;
  classBtnConfirm?: string;

  children: any;
}
export default function Form({
  title,
  categoryId = undefined,
  errorMessage,
  successMessage,
  infoMessage,
  canSubmit,
  handleSubmit,
  textBtnConfirm = "Valider",
  classBtnConfirm = "",
  children,
}: FormProps) {
  return (
    <>
      <NextSeo title={title} />
      <div className={`App ${styles["create-app"]}`}>
        <h2>{title}</h2>
        <form onSubmit={handleSubmit}>
          {children}
          <button
            type="submit"
            className={classBtnConfirm}
            disabled={!canSubmit}
          >
            {textBtnConfirm}
          </button>
        </form>
        <Link href={categoryId ? `/?categoryId=${categoryId}` : "/"}>
          ← Revenir à l'accueil
        </Link>
        <MessageManager
          info={infoMessage}
          error={errorMessage}
          success={successMessage}
        />
      </div>
    </>
  );
}
