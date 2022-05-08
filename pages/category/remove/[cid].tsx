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

import { prisma } from '../../../utils/back';

function RemoveCategory({ category }: { category: Category; }) {
    const [canSubmit, setCanSubmit] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (category.links.length > 0) {
            setError('Vous devez supprimer tous les liens de cette catégorie avant de pouvoir supprimer cette catégorie')
            setCanSubmit(false);
        } else {
            setCanSubmit(true);
        }
    }, [category]);

    if (status === 'loading') {
        return (<p>Chargement de la session en cours</p>)
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        confirmAlert({
            message: `Confirmer la suppression du lien "${category.name}"`,
            buttons: [{
                label: 'Yes',
                onClick: async () => {
                    setSuccess(null);
                    setError(null);
                    setCanSubmit(false);
                    nProgress.start();

                    try {
                        const { data }: AxiosResponse<any> = await axios.delete(`/api/category/remove/${category.id}`);
                        setSuccess(data?.success || 'Categorie supprimée avec succès');
                        setCanSubmit(false);
                    } catch (error) {
                        setError(HandleAxiosError(error));
                        setCanSubmit(true);
                    } finally {
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
            title='Supprimer une catégorie'
            errorMessage={error}
            successMessage={success}
            canSubmit={canSubmit}
            handleSubmit={handleSubmit}
            classBtnConfirm='red-btn'
            textBtnConfirm='Supprimer'
        >
            <TextBox
                name='name'
                label='Nom'
                value={category.name}
                fieldClass={styles['input-field']}
                disabled={true}
            />
        </FormLayout>
    </>);
}

RemoveCategory.authRequired = true;
export default RemoveCategory;

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