import styles from '../../styles/links.module.scss';

export default function Link({ link }) {
    return (
        <li className={styles['link']}>
            <a href={link?.url} target={'_blank'} rel={'noreferrer'}>
                <span className={styles['link-name']}>{link?.name} <span className={styles['link-category']}>— {link?.categoryName}</span></span> <span className={styles['link-url']}>{link?.url}</span>
            </a>
        </li>
    );
}