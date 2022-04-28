import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

import Input from '../../components/input';
import styles from '../../styles/create.module.scss';

import { Category } from '../../types';
import { BuildCategory } from '../../utils/front';

import { PrismaClient } from '@prisma/client';
import Selector from '../../components/selector';
import Head from 'next/head';
const prisma = new PrismaClient();

export default function CreateLink({ categories }: { categories: Category[]; }) {
    const { status } = useSession({ required: true });
    const [name, setName] = useState<string>('');
    const [url, setUrl] = useState<string>('');
    const [categoryId, setCategoryId] = useState<number | null>(categories?.[0].id || null);
    const [canSubmit, setCanSubmit] = useState<boolean>(false);

    useEffect(() => {
        const regex = new RegExp('https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}');
        if (name !== '' && url.match(regex) && categoryId !== null) {
            setCanSubmit(false);
        } else {
            setCanSubmit(true);
        }
    }, [name, url, categoryId]);

    if (status === 'loading') {
        return (<p>Chargement de la session en cours</p>)
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('On peut envoyer la requête pour créer un lien');
    }

    return (<>
        <Head>
            <title>Superpipo — Créer un lien</title>
        </Head>
        <div className={`App ${styles['create-app']}`}>
            <h2>Créer un lien</h2>
            <form onSubmit={handleSubmit}>
                <Input
                    name='name'
                    label='Label'
                    onChangeCallback={({ target }, value) => setName(value)}
                    value={name}
                    fieldClass={styles['input-field']}
                    placeholder='Label du lien'
                />
                <Input
                    name='url'
                    label='URL'
                    onChangeCallback={({ target }, value) => setUrl(value)}
                    value={name}
                    fieldClass={styles['input-field']}
                    placeholder='URL du lien'
                />
                <Selector
                    name='category'
                    label='Catégorie'
                    value={categoryId}
                    onChangeCallback={({ target }, value) => setCategoryId(value)}
                >
                    {categories.map((category, key) => (
                        <option key={key} value={category.id}>{category.name}</option>
                    ))}
                </Selector>
                <button type='submit' disabled={canSubmit}>
                    Valider
                </button>
            </form>
            <Link href='/'>
                <a>← Revenir à l'accueil</a>
            </Link>
        </div>
    </>);
}

export async function getStaticProps() {
    const categoriesDB = await prisma.category.findMany();
    const categories = categoriesDB.map((categoryDB) => BuildCategory(categoryDB));

    return {
        props: {
            categories: JSON.parse(JSON.stringify(categories))
        }
    }
}