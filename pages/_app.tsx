import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

import { useRouter } from "next/router";

import nProgress from "nprogress";
import "nprogress/nprogress.css";

import AuthRequired from "../components/AuthRequired";

import { DefaultSeo } from "next-seo";
import "../styles/globals.scss";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();

  useEffect(() => {
    // Chargement pages
    router.events.on("routeChangeStart", nProgress.start);
    router.events.on("routeChangeComplete", nProgress.done);
    router.events.on("routeChangeError", nProgress.done);

    return () => {
      router.events.off("routeChangeStart", nProgress.start);
      router.events.off("routeChangeComplete", nProgress.done);
      router.events.off("routeChangeError", nProgress.done);
    };
  });

  return (
    <SessionProvider session={session}>
      <DefaultSeo titleTemplate="MyLinks — %s" defaultTitle="MyLinks" />
      {Component.authRequired ? (
        <AuthRequired>
          <Component {...pageProps} />
        </AuthRequired>
      ) : (
        <Component {...pageProps} />
      )}
    </SessionProvider>
  );
}

export default MyApp;
