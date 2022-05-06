import { useEffect, useState } from 'react';

import nProgress from 'nprogress';
import axios, { AxiosResponse } from 'axios';

import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

import FormLayout from '../../../components/FormLayout';
import TextBox from '../../../components/TextBox';

import styles from '../../../styles/create.module.scss';

import { Category } from '../../../types';
import { BuildCategory, HandleAxiosError } from '../../../utils/front';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function EditCategory({ category }: { category: Category; }) {
    const [name, setName] = useState<string>(category.name);

    const [canSubmit, setCanSubmit] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (name !== category.name && name !== '') {
            setCanSubmit(true);
        } else {
            setCanSubmit(false);
        }
    }, [category, name]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        confirmAlert({
            message: `Confirmer l'édition de la catégorie "${category.name}"`,
            buttons: [{
                label: 'Yes',
                onClick: async () => {
                    setSuccess(null);
                    setError(null);
                    setCanSubmit(false);
                    nProgress.start();

                    try {
                        const payload = { name };
                        const { data }: AxiosResponse<any> = await axios.put(`/api/category/edit/${category.id}`, payload);
                        setSuccess(data?.success || 'Catégorie modifiée avec succès');
                    } catch (error) {
                        setError(HandleAxiosError(error));
                    } finally {
                        setCanSubmit(true);
                        nProgress.done();
                    }
                }
            }, {
                label: 'No',
                onClick: () => { }
            }]
        });
    }

    return (<>
        <FormLayout
            title='Modifier une catégorie'
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
                placeholder={`Nom original : ${category.name}`}
            />
        </FormLayout>
    </>);
}

EditCategory.authRequired = true;
export default EditCategory;

export async function getServerSideProps({ query }) {
    const { cid } = query;
    const categoryDB = await prisma.category.findFirst({
        where: { id: Number(cid) },
        include: { links: true }
    });

    if (!categoryDB) {
        return {
            redirect: {
                destination: '/'
            }
        }
    }

    const category = BuildCategory(categoryDB);
    return {
        props: {
            category: JSON.parse(JSON.stringify(category))
        }
    }
}