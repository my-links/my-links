import styles from '../../styles/home/categories.module.scss';
import { Link } from '../../types';

export default function Favorites({ favorites }: { favorites: Link[]; }) {
    return (
        <div className={`${styles['block-wrapper']} ${styles['favorites']}`}>
            <h4>Favoris</h4>
            <ul className={styles['items']}>
                {favorites.length === 0
                    ? <NoFavLink />
                    : favorites.map((link, key) => (
                        <LinkFavorite link={link} key={key} />
                    ))}
            </ul>
        </div>
    )
}

function NoFavLink(): JSX.Element {
    return (
        <li className={styles['no-fav-link']}>
            Aucun favoris
        </li>
    )
}

function LinkFavorite({ link }: { link: Link; }): JSX.Element {
    const { name, url, category } = link;
    return (
        <li className={styles['item']}>
            <a href={url} target={'_blank'} rel={'noreferrer'}>
                {name}<span className={styles['category']}> - {category.name}</span>
            </a>
        </li>
    )
}