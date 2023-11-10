import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import nextI18NextConfig from "../../next-i18next.config";

async function getServerSideTranslation(locale: string = "en") {
  return await serverSideTranslations(
    locale,
    ["common", "login"],
    nextI18NextConfig
  );
}

export { getServerSideTranslation };
