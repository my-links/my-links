import Head from 'next/head';
import Link from 'next/link';

import MessageManager from './MessageManager';

import styles from '../styles/create.module.scss';

interface FormProps {
    title: string;
    errorMessage?: string;
    successMessage?: string;
    infoMessage?: string;

    canSubmit: boolean;
    handleSubmit: (event) => void;

    textBtnConfirm?: string;
    classBtnConfirm?: string;

    children: any;
}
export default function Form({
    title,
    errorMessage,
    successMessage,
    infoMessage,
    canSubmit,
    handleSubmit,
    textBtnConfirm = 'Valider',
    classBtnConfirm = '',
    children
}: FormProps) {
    return (<>
        <Head>
            <title>Superpipo — {title}</title>
        </Head>
        <div className={`App ${styles['create-app']}`}>
            <h2>{title}</h2>
            <form onSubmit={handleSubmit}>
                {children}
                <button type='submit' className={classBtnConfirm} disabled={!canSubmit}>
                    {textBtnConfirm}
                </button>
            </form>
            <Link href='/'>
                <a>← Revenir à l'accueil</a>
            </Link>
            <MessageManager
                info={infoMessage}
                error={errorMessage}
                success={successMessage}
            />
        </div>
    </>)
}