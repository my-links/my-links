import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

import Input from '../../components/input';
import styles from '../../styles/create.module.scss';
import Head from 'next/head';

export default function CreateCategory() {
    const { data: session, status } = useSession({ required: true });
    const [name, setName] = useState<string>('');

    if (status === 'loading') {
        return (<p>Chargement de la session en cours</p>)
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('On peut envoyer la requête pour créer une catégorie');
    }

    return (
        <div className={`App ${styles['create-app']}`}>
            <Head>
                <title>Superpipo — Créer une categorie</title>
            </Head>
            <h2>Créer une categorie</h2>
            <form onSubmit={handleSubmit}>
                <Input
                    name='name'
                    label='Nom de la catégorie'
                    onChangeCallback={({ target }, value) => setName(value)}
                    value={name}
                    fieldClass={styles['input-field']}
                />
                <button type='submit' disabled={name.length < 1}>
                    Valider
                </button>
            </form>
            <Link href='/'>
                <a>← Revenir à l'accueil</a>
            </Link>
        </div>
    );
}
