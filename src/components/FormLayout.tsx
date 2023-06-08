import { NextSeo } from "next-seo";
import Link from "next/link";

import MessageManager from "components/MessageManager/MessageManager";

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
  disableHomeLink?: boolean;
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
  disableHomeLink = false,
}: FormProps) {
  return (
    <>
      <NextSeo title={title} />
      <h2>{title}</h2>
      <form onSubmit={handleSubmit}>
        {children}
        <button type="submit" className={classBtnConfirm} disabled={!canSubmit}>
          {textBtnConfirm}
        </button>
      </form>
      {!disableHomeLink && (
        <Link href={categoryId ? `/?categoryId=${categoryId}` : "/"}>
          ← Revenir à l'accueil
        </Link>
      )}
      <MessageManager
        info={infoMessage}
        error={errorMessage}
        success={successMessage}
      />
    </>
  );
}
