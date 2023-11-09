// Source : https://react.i18next.com/latest/using-with-hooks

import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import nextI18NextConfig from "../../next-i18next.config";

async function getServerSideTranslation(locale: string) {
  return await serverSideTranslations(
    locale,
    ["common", "translation"],
    nextI18NextConfig
  );
}

export { getServerSideTranslation };
