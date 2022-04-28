import styles from '../../styles/home/links.module.scss';
import { Category, Link } from '../../types';

export default function Links({ category }: { category: Category; }) {
    const { name, links } = category;

    return (<div className={styles['links-wrapper']}>
        <h2>{name}<span className={styles['links-count']}> — {links.length}</span></h2>
        <ul className={styles['links']}>
            {links.map((link, key) => (
                <LinkItem key={key} link={link} />
            ))}
        </ul>
    </div>);
}

function LinkItem({ link }: { link: Link; }) {
    const { name, url, category } = link;
    const { origin, pathname, search } = new URL(url);

    return (
        <li className={styles['link']}>
            <a href={url} target={'_blank'} rel={'noreferrer'}>
                <span className={styles['link-name']}>
                    {name}<span className={styles['link-category']}> — {category.name}</span>
                </span>
                <LinkItemURL
                    origin={origin}
                    pathname={pathname}
                    search={search}
                />
            </a>
        </li>
    );
}

function LinkItemURL({ origin, pathname, search }) {
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
}