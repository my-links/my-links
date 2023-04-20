import axios from 'axios';
import { useRouter } from 'next/router';
import nProgress from 'nprogress';
import { useMemo, useState } from 'react';

import { redirectWithoutClientCache } from '../../utils/client';
import { HandleAxiosError } from '../../utils/front';

import FormLayout from '../../components/FormLayout';
import TextBox from '../../components/TextBox';

import styles from '../../styles/create.module.scss';

function CreateCategory() {
    const router = useRouter();
    const info = useRouter().query?.info as string;
    const [name, setName] = useState<string>('');

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const canSubmit = useMemo<boolean>(() => name.length !== 0 && !submitted, [name.length, submitted]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSuccess(null);
        setError(null);
        setSubmitted(false);
        nProgress.start();

        try {
            await axios.post('/api/category/create', { name });
            redirectWithoutClientCache(router, '');
            router.push('/')
        } catch (error) {
            setError(HandleAxiosError(error));
            setSubmitted(true);
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
