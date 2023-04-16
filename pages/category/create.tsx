import { useEffect, useState } from 'react';

import nProgress from 'nprogress';
import axios, { AxiosResponse } from 'axios';

import FormLayout from '../../components/FormLayout';
import TextBox from '../../components/TextBox';

import styles from '../../styles/create.module.scss';
import { HandleAxiosError } from '../../utils/front';
import { useRouter } from 'next/router';

function CreateCategory() {
    const info = useRouter().query?.info as string;
    const [name, setName] = useState<string>('');

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [canSubmit, setCanSubmit] = useState<boolean>(false);

    useEffect(() => setCanSubmit(name.length !== 0), [name]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSuccess(null);
        setError(null);
        setCanSubmit(false);
        nProgress.start();

        try {
            const payload = { name };
            const { data }: AxiosResponse<any> = await axios.post('/api/category/create', payload);
            setSuccess(data?.success || 'Categorie créée avec succès');
            setCanSubmit(false);
        } catch (error) {
            setError(HandleAxiosError(error));
            setCanSubmit(true);
        } finally {
            nProgress.done();
        }
    }

    return (<>
        <FormLayout
            title='Créer une catégorie'
            errorMessage={error}
            successMessage={success}
            infoMessage={info}
            canSubmit={canSubmit}
            handleSubmit={handleSubmit}
        >
            <TextBox
                name='name'
                label='Nom de la catégorie'
                onChangeCallback={(value) => setName(value)}
                value={name}
                fieldClass={styles['input-field']}
                placeholder='Nom...'
            />
        </FormLayout>
    </>);
}

CreateCategory.authRequired = true;
export default CreateCategory;
