import Head from 'next/head';
import styles from '../styles/error-page.module.scss';

import { config } from '../config';

export default function Custom500() {
    return (<>
        <Head>
            <title>{config.siteName} — Une erreur côté serveur est survenue</title>
        </Head>
        <div className={styles['App']}>
            <h1>500</h1>
            <h2>Une erreur côté serveur est survenue.</h2>
        </div>
    </>)
}