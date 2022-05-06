import { useEffect, useState } from 'react';

import axios, { AxiosResponse } from 'axios';
import nProgress from 'nprogress';

import FormLayout from '../../../components/FormLayout';
import TextBox from '../../../components/TextBox';
import Selector from '../../../components/Selector';
import Checkbox from '../../../components/Checkbox';

import styles from '../../../styles/create.module.scss';

import { Category, Link } from '../../../types';
import { BuildCategory, BuildLink, HandleAxiosError, IsValidURL } from '../../../utils/front';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function EditLink({ link, categories }: { link: Link; categories: Category[]; }) {
    const [name, setName] = useState<string>(link.name);
    const [url, setUrl] = useState<string>(link.url);
    const [favorite, setFavorite] = useState<boolean>(link.favorite);
    const [categoryId, setCategoryId] = useState<number | null>(link.category?.id || null);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [canSubmit, setCanSubmit] = useState<boolean>(false);

    useEffect(() => {
        if (name !== link.name || url !== link.url || favorite !== link.favorite || categoryId !== link.category.id) {
            if (name !== '' && IsValidURL(url) && favorite !== null && categoryId !== null) {
                setCanSubmit(true);
            } else {
                setCanSubmit(false);
            }
        } else {
            setCanSubmit(false);
        }
    }, [name, url, favorite, categoryId, link]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSuccess(null);
        setError(null);
        setCanSubmit(false);
        nProgress.start();

        try {
            const payload = { name, url, favorite, categoryId };
            const { data }: AxiosResponse<any> = await axios.put(`/api/link/edit/${link.id}`, payload);
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
            title='Modifier un lien'
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
                placeholder={`Nom original : ${link.name}`}
            />
            <TextBox
                name='url'
                label='URL'
                onChangeCallback={(value) => setUrl(value)}
                value={url}
                fieldClass={styles['input-field']}
                placeholder={`URL original : ${link.url}`}
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

EditLink.authRequired = true;
export default EditLink;

export async function getServerSideProps({ query }) {
    const { lid } = query;

    const categoriesDB = await prisma.category.findMany();
    const categories = categoriesDB.map((categoryDB) => BuildCategory(categoryDB));

    const linkDB = await prisma.link.findFirst({
        where: { id: Number(lid) },
        include: { category: true }
    });

    if (!linkDB) {
        return {
            redirect: {
                destination: '/'
            }
        }
    }

    const link = BuildLink(linkDB, { categoryId: linkDB.categoryId, categoryName: linkDB.category.name });
    return {
        props: {
            link: JSON.parse(JSON.stringify(link)),
            categories: JSON.parse(JSON.stringify(categories))
        }
    }
}