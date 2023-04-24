import { Head, Html, Main, NextScript } from "next/document";

const Document = () => (
  <Html lang="fr">
    <Head>
      <meta name="theme-color" content="#f0eef6" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=Rubik:ital,wght@0,400;0,700;1,400;1,700&display=swap"
        rel="stylesheet"
      />
      <meta charSet="UTF-8" />
    </Head>
    <body>
      <noscript>Vous devez activer JavaScript pour utiliser ce site</noscript>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
