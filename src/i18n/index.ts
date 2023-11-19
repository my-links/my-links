import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import nextI18NextConfig from "../../next-i18next.config";

async function getServerSideTranslation(
  locale: string = "en",
  requiredNs: string[] = [],
) {
  return await serverSideTranslations(
    locale,
    ["common", ...requiredNs],
    nextI18NextConfig,
  );
}

export { getServerSideTranslation };
