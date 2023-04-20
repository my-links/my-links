import { Provider } from "next-auth/providers";
import { getProviders, signIn, useSession } from "next-auth/react";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { useRouter } from "next/router";

import MessageManager from "../components/MessageManager/MessageManager";

import styles from "../styles/login.module.scss";

export default function SignIn({ providers }: { providers: Provider[] }) {
  const { data: session, status } = useSession();
  const info = useRouter().query?.info as string;
  const error = useRouter().query?.error as string;

  if (status === "loading") {
    return (
      <div className="App" style={{ alignItems: "center" }}>
        <p style={{ height: "fit-content" }}>
          Chargement de la session en cours
        </p>
      </div>
    );
  }

  return (
    <>
      <NextSeo title="Authentification" />
      <div className="App">
        <div className={styles["wrapper"]}>
          <h2>Se connecter</h2>
          <MessageManager error={error} info={info} />
          {session !== null && (
            <MessageManager info="Vous êtes déjà connecté" />
          )}
          <div className={styles["providers"]}>
            {Object.values(providers).map(({ name, id }) => (
              <button
                key={id}
                onClick={() => signIn(id, { callbackUrl: "/" })}
                disabled={session !== null}
              >
                Continuer avec {name}
              </button>
            ))}
          </div>
          <Link href="/">← Revenir à l'accueil</Link>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}
