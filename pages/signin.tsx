import { getProviders, signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import Link from 'next/link';
import Head from 'next/head';

import styles from '../styles/login.module.scss';
import MessageManager from '../components/MessageManager';

export default function SignIn({ providers }) {
    const { data: session, status } = useSession();
    const info = useRouter().query?.info as string;
    const error = useRouter().query?.error as string;

    if (status === 'loading') {
        return (
            <div className='App' style={{ alignItems: 'center' }}>
                <p style={{ height: 'fit-content' }}>Chargement de la session en cours</p>
            </div>
        );
    }

    return (<>
        <Head>
            <title>Superpipo — Authentification</title>
        </Head>
        <div className='App'>
            <div className={styles['wrapper']}>
                <h2>Se connecter</h2>
                <MessageManager
                    error={error}
                    info={info}
                />
                {session !== null && (<MessageManager info='Vous êtes déjà connecté' />)}
                <div className={styles['providers']}>
                    {Object.values(providers).map(({ name, id }) => (
                        <button key={id} onClick={() => signIn(id, { callbackUrl: '/' })} disabled={session !== null}>
                            Continuer avec {name}
                        </button>
                    ))}
                </div>
                <Link href='/'>
                    <a>← Revenir à l'accueil</a>
                </Link>
            </div>
        </div>
    </>);
}

export async function getServerSideProps(context) {
    const providers = await getProviders();
    return {
        props: { providers }
    }
}