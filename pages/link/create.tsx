import axios, { AxiosResponse } from 'axios';
import { useRouter } from 'next/router';
import nProgress from 'nprogress';
import { useMemo, useState } from 'react';

import Checkbox from '../../components/Checkbox';
import FormLayout from '../../components/FormLayout';
import Selector from '../../components/Selector';
import TextBox from '../../components/TextBox';

import { Category, Link } from '../../types';
import { BuildCategory, HandleAxiosError, IsValidURL } from '../../utils/front';

import { prisma } from '../../utils/back';

import styles from '../../styles/create.module.scss';

function CreateLink({ categories }: { categories: Category[]; }) {
    const { query } = useRouter();
    const categoryIdQuery = Number(query.categoryId?.[0]);

    const [name, setName] = useState<Link['name']>('');
    const [url, setUrl] = useState<Link['url']>('');
    const [favorite, setFavorite] = useState<Link['favorite']>(false);
    const [categoryId, setCategoryId] = useState<Link['category']['id']>(categoryIdQuery || categories?.[0].id || null);

    const [error, setError] = useState<string>(null);
    const [success, setSuccess] = useState<string>(null);
    const [submitted, setSubmitted] = useState<boolean>(false);

    const canSubmit = useMemo<boolean>(
        () => name !== '' && IsValidURL(url) && favorite !== null && categoryId !== null && !submitted,
        [name, url, favorite, categoryId, submitted]
    );

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSuccess(null);
        setError(null);
        setSubmitted(false);
        nProgress.start();

        try {
            const payload = { name, url, favorite, categoryId };
            const { data }: AxiosResponse<any> = await axios.post('/api/link/create', payload);
            setSuccess(data?.success || 'Lien modifié avec succès');
        } catch (error) {
            setError(HandleAxiosError(error));
        } finally {
            setSubmitted(true);
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