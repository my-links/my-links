import { Provider } from "next-auth/providers";
import { getProviders, signIn } from "next-auth/react";
import { NextSeo } from "next-seo";
import Link from "next/link";

import MessageManager from "components/MessageManager/MessageManager";
import PATHS from "constants/paths";
import { getSession } from "utils/session";

import styles from "styles/login.module.scss";

interface SignInProps {
  providers: Provider[];
}
export default function SignIn({ providers }: SignInProps) {
  return (
    <>
      <NextSeo title="Authentification" />
      <div className="App">
        <div className={styles["wrapper"]}>
          <h2>Se connecter</h2>
          <MessageManager />
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
          <Link href={PATHS.HOME}>← Revenir à l'accueil</Link>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ req, res }) {
  const session = await getSession(req, res);
  if (session) {
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
