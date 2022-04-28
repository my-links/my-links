import { SessionProvider } from 'next-auth/react';
import nProgress from "nprogress";
import { useRouter } from "next/router";

import '../styles/globals.scss';
import "nprogress/nprogress.css"
import { useEffect } from 'react';

function MyApp({
	Component,
	pageProps: { session, ...pageProps }
}) {
	const router = useRouter();

	useEffect(() => { // Chargement pages
		router.events.on('routeChangeStart', nProgress.start);
		router.events.on('routeChangeComplete', nProgress.done);
		router.events.on('routeChangeError', nProgress.done);

		return () => {
			router.events.off('routeChangeStart', nProgress.start);
			router.events.off('routeChangeComplete', nProgress.done);
			router.events.off('routeChangeError', nProgress.done);
		}
	});

	return (
		<SessionProvider session={session}>
			<Component {...pageProps} />
		</SessionProvider>
	);
}

export default MyApp;