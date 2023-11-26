import MessageManager from 'components/MessageManager/MessageManager';
import { i18n, useTranslation } from 'next-i18next';
import { NextSeo } from 'next-seo';
import Link from 'next/link';

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
  textBtnConfirm = i18n.t('common:confirm'),
  classBtnConfirm = '',
  children,
  disableHomeLink = false,
}: FormProps) {
  const { t } = useTranslation();

  return (
    <>
      <NextSeo title={title} />
      <h2>{title}</h2>
      <form onSubmit={handleSubmit}>
        {children}
        <button
          type='submit'
          className={classBtnConfirm}
          disabled={!canSubmit}
        >
          {textBtnConfirm}
        </button>
      </form>
      {!disableHomeLink && (
        <Link href={categoryId ? `/?categoryId=${categoryId}` : '/'}>
          {t('common:back-home')}
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
