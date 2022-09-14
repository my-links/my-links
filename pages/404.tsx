import Head from 'next/head';
import styles from '../styles/error-page.module.scss';

import { config } from '../config';

export default function Custom404() {
    return (<>
        <Head>
            <title>{config.siteName} — Page introuvable</title>
        </Head>
        <div className={styles['App']}>
            <h1>404</h1>
            <h2>Cette page est introuvable.</h2>
        </div>
    </>)
}