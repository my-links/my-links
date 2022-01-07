import styles from '../../styles/links.module.scss';

export default function Link({ link }) {
    return (
        <li className={styles['link']}>
            <a href={link?.link} target={'_blank'} rel={'noreferrer'}>
                <span className={styles['link-name']}>{link?.name}</span> <span className={styles['link-url']}>{link?.link}</span>
            </a>
        </li>
    );
}