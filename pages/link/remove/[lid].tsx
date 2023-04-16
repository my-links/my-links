import { useState } from 'react';

import axios, { AxiosResponse } from 'axios';
import nProgress from 'nprogress';

import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

import FormLayout from '../../../components/FormLayout';
import TextBox from '../../../components/TextBox';
import Checkbox from '../../../components/Checkbox';

import styles from '../../../styles/create.module.scss';

import { Link } from '../../../types';
import { BuildLink, HandleAxiosError } from '../../../utils/front';

import { prisma } from '../../../utils/back';

function RemoveLink({ link }: { link: Link; }) {

    const [canSubmit, setCanSubmit] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = (event) => {
        event.preventDefault();
        confirmAlert({
            message: `Confirmer la suppression du lien "${link.name}"`,
            buttons: [{
                label: 'Confirmer',
                onClick: async () => {
                    setSuccess(null);
                    setError(null);
                    setCanSubmit(false);
                    nProgress.start();

                    try {
                        const { data }: AxiosResponse<any> = await axios.delete(`/api/link/remove/${link.id}`);
                        setSuccess(data?.success || 'Lien supprimé avec succès');
                        setCanSubmit(false);
                    } catch (error) {
                        setError(HandleAxiosError(error));
                        setCanSubmit(true);
                    } finally {
                        nProgress.done();
                    }
                }
            }, {
                label: 'Annuler',
                onClick: () => { }
            }]
        });
    }

    return (<>
        <FormLayout
            title='Supprimer un lien'
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
                value={link.name}
                fieldClass={styles['input-field']}
                disabled={true}
            />
            <TextBox
                name='url'
                label='URL'
                value={link.url}
                fieldClass={styles['input-field']}
                disabled={true}
            />
            <TextBox
                name='category'
                label='Catégorie'
                value={link.category.name}
                fieldClass={styles['input-field']}
                disabled={true}
            />
            <Checkbox
                name='favorite'
                label='Favoris'
                isChecked={link.favorite}
                disabled={true}
            />
        </FormLayout>
    </>);
}

RemoveLink.authRequired = true;
export default RemoveLink;

export async function getServerSideProps({ query }) {
    const { lid } = query;
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
            link: JSON.parse(JSON.stringify(link))
        }
    }
}