import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import nProgress from "nprogress";
import { useEffect } from "react";

import AuthRequired from "../components/AuthRequired";

import { trpc } from "../utils/trpc";

import "nprogress/nprogress.css";
import "../styles/globals.scss";

interface MyAppProps extends AppProps {
  Component: any; // TODO: fix type
}
function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: MyAppProps) {
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

export default trpc.withTRPC(MyApp);
