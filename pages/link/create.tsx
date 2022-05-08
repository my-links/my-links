import { useEffect, useState } from 'react';

import nProgress from 'nprogress';
import axios, { AxiosResponse } from 'axios';

import FormLayout from '../../components/FormLayout';
import TextBox from '../../components/TextBox';
import Selector from '../../components/Selector';
import Checkbox from '../../components/Checkbox';

import styles from '../../styles/create.module.scss';

import { Category } from '../../types';
import { BuildCategory, HandleAxiosError, IsValidURL } from '../../utils/front';

import { prisma } from '../../utils/back';

function CreateLink({ categories }: { categories: Category[]; }) {
    const [name, setName] = useState<string>('');
    const [url, setUrl] = useState<string>('');
    const [favorite, setFavorite] = useState<boolean>(false);
    const [categoryId, setCategoryId] = useState<number | null>(categories?.[0].id || null);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [canSubmit, setCanSubmit] = useState<boolean>(false);

    useEffect(() => {
        if (name !== '' && IsValidURL(url) && favorite !== null && categoryId !== null) {
            setCanSubmit(true);
        } else {
            setCanSubmit(false);
        }
    }, [name, url, favorite, categoryId]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSuccess(null);
        setError(null);
        setCanSubmit(false);
        nProgress.start();

        try {
            const payload = { name, url, favorite, categoryId };
            const { data }: AxiosResponse<any> = await axios.post('/api/link/create', payload);
            setSuccess(data?.success || 'Lien modifié avec succès');
        } catch (error) {
            setError(HandleAxiosError(error));
        } finally {
            setCanSubmit(true);
            nProgress.done();
        }
    }

    return (<>
        <FormLayout
            title='Créer un lien'
            errorMessage={error}
            successMessage={success}
            canSubmit={canSubmit}
            handleSubmit={handleSubmit}
        >
            <TextBox
                name='name'
                label='Nom'
                onChangeCallback={(value) => setName(value)}
                value={name}
                fieldClass={styles['input-field']}
                placeholder='Nom du lien'
            />
            <TextBox
                name='url'
                label='URL'
                onChangeCallback={(value) => setUrl(value)}
                value={url}
                fieldClass={styles['input-field']}
                placeholder='https://www.example.org/'
            />
            <Selector
                name='category'
                label='Catégorie'
                value={categoryId}
                onChangeCallback={(value: number) => setCategoryId(value)}
                options={categories.map(({ id, name }) => ({ label: name, value: id }))}
            />
            <Checkbox
                name='favorite'
                isChecked={favorite}
                onChangeCallback={(value) => setFavorite(value)}
                label='Favoris'
            />
        </FormLayout>
    </>);
}

CreateLink.authRequired = true;
export default CreateLink;

export async function getServerSideProps() {
    const categoriesDB = await prisma.category.findMany();
    const categories = categoriesDB.map((categoryDB) => BuildCategory(categoryDB));

    return {
        props: {
            categories: JSON.parse(JSON.stringify(categories))
        }
    }
}