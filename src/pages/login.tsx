import ButtonLink from "components/ButtonLink";
import LangSelector from "components/LangSelector/LangSelector";
import MessageManager from "components/MessageManager/MessageManager";
import PageTransition from "components/PageTransition";
import PATHS from "constants/paths";
import { getServerSideTranslation } from "i18n/index";
import getUser from "lib/user/getUser";
import { Provider } from "next-auth/providers";
import { getProviders, signIn } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { NextSeo } from "next-seo";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import styles from "styles/login.module.scss";
import { getSession } from "utils/session";

interface SignInProps {
  providers: Provider[];
}
export default function SignIn({ providers }: SignInProps) {
  const { t } = useTranslation("login");

  return (
    <div className={styles["login-page"]}>
      <PageTransition className={styles["login-container"]}>
        <NextSeo title={t("login:title")} />
        <div className={styles["image-wrapper"]}>
          <Image
            src={"/logo-light.png"}
            width={300}
            height={100}
            alt="MyLinks's logo"
          />
        </div>
        <div className={styles["form-wrapper"]}>
          <h1>{t("login:title")}</h1>
          <MessageManager info={t("login:informative-text")} />
          {Object.values(providers).map(({ name, id }) => (
            <ButtonLink
              onClick={() => signIn(id, { callbackUrl: PATHS.HOME })}
              className={styles["login-button"]}
              key={id}
            >
              <FcGoogle size={"1.5em"} />{" "}
              {t("login:continue-with", { provider: name } as undefined)}
            </ButtonLink>
          ))}
        </div>
      </PageTransition>
      <LangSelector />
    </div>
  );
}

export async function getServerSideProps({ req, res, locale }) {
  const session = await getSession(req, res);
  const user = await getUser(session);
  if (user) {
    return {
      redirect: {
        destination: PATHS.HOME,
      },
    };
  }

  const providers = await getProviders();
  return {
    props: {
      session,
      providers,
      ...(await getServerSideTranslation(locale)),
    },
  };
}
