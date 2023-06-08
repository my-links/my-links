import { Provider } from "next-auth/providers";
import { getProviders, signIn } from "next-auth/react";
import { NextSeo } from "next-seo";

import MessageManager from "components/MessageManager/MessageManager";
import PageTransition from "components/PageTransition";

import PATHS from "constants/paths";
import getUser from "lib/user/getUser";
import { getSession } from "utils/session";

import styles from "styles/form.module.scss";

interface SignInProps {
  providers: Provider[];
}
export default function SignIn({ providers }: SignInProps) {
  return (
    <PageTransition className={styles["form-container"]}>
      <NextSeo title="Authentification" />
      <h2>Se connecter</h2>
      <MessageManager info="Authentification requise pour utiliser ce service" />
      <div className={styles["providers"]}>
        {Object.values(providers).map(({ name, id }) => (
          <button
            onClick={() => signIn(id, { callbackUrl: PATHS.HOME })}
            key={id}
          >
            Continuer avec {name}
          </button>
        ))}
      </div>
    </PageTransition>
  );
}

export async function getServerSideProps({ req, res }) {
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
    props: { providers },
  };
}
