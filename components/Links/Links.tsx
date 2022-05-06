import LinkTag from 'next/link';

import { Category, Link } from '../../types';

import EditSVG from '../../public/icons/edit.svg';
import RemoveSVG from '../../public/icons/remove.svg';

import styles from '../../styles/home/links.module.scss';

export default function Links({ category }: { category: Category; }) {
    if (category === null) {
        return (<div className={styles['no-category']}>
            <p>Veuillez séléctionner une categorié</p>
            <LinkTag href='/category/create'>
                <a>ou en créer une</a>
            </LinkTag>
        </div>)
    }

    const { name, links } = category;
    if (links.length === 0) {
        return (<div className={styles['no-link']}>
            <p>Aucun lien pour <b>{category.name}</b></p>
            <LinkTag href='/link/create'>
                <a>Créer un lien</a>
            </LinkTag>
        </div>)
    }

    return (<div className={styles['links-wrapper']}>
        <h2>{name}<span className={styles['links-count']}> — {links.length}</span></h2>
        <ul className={styles['links']} key={Math.random()}>
            {links.map((link, key) => (
                <LinkItem key={key} link={link} />
            ))}
        </ul>
    </div>);
}

function LinkItem({ link }: { link: Link; }) {
    const { id, name, url, category } = link;
    return (
        <li className={styles['link']} key={id}>
            <a href={url} target={'_blank'} rel={'noreferrer'}>
                <span className={styles['link-name']}>
                    {name}<span className={styles['link-category']}> — {category.name}</span>
                </span>
                <LinkItemURL url={url} />
            </a>
            <div className={styles['controls']}>
                <LinkTag href={`/link/edit/${id}`}>
                    <a className={styles['edit']}>
                        <EditSVG />
                    </a>
                </LinkTag>
                <LinkTag href={`/link/remove/${id}`}>
                    <a className={styles['remove']}>
                        <RemoveSVG />
                    </a>
                </LinkTag>
            </div>
        </li>
    );
}

function LinkItemURL({ url }: { url: string; }) {
    try {
        const { origin, pathname, search } = new URL(url);
        let text = '';

        if (pathname !== '/') {
            text += pathname;
        }

        if (search !== '') {
            if (text === '') {
                text += '/';
            }
            text += search;
        }

        return (
            <span className={styles['link-url']}>
                {origin}<span className={styles['url-pathname']}>{text}</span>
            </span>
        )
    } catch (error) {
        console.error('error', error);
        return (
            <span className={styles['link-url']}>
                {url}
            </span>
        )
    }
}