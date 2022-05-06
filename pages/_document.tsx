import { Html, Head, Main, NextScript } from 'next/document';

const Document = () => (
    <Html lang='fr'>
        <Head>
            <link
                href='https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=Rubik:ital,wght@0,400;0,700;1,400;1,700&display=swap'
                rel='stylesheet'
            />
        </Head>
        <title>Superpipo</title>
        <body>
            <noscript>
                Vous devez activer JavaScript pour utiliser ce site
            </noscript>
            <Main />
            <NextScript />
        </body>
    </Html>
)

export default Document;