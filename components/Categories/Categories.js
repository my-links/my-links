import styles from '../../styles/categories.module.scss';

export default function Categories({ categories, favorites, handleSelectCategory, categoryActive }) {
    return (<div className={styles['categories-wrapper']}>
        <div className={`${styles['block-wrapper']} ${styles['favorites']}`}>
            <h4>Favoris</h4>
            <ul className={styles['items']}>
                {favorites.map((link, key) => {
                    const { name, url, categoryName } = link;
                    return <li key={key} className={styles['item']}>
                        <a href={url} target={'_blank'} rel={'noreferrer'}>
                            {name} <span className={styles['category']}>- {categoryName}</span>
                        </a>
                    </li>;
                })}
            </ul>
        </div>
        <div className={`${styles['block-wrapper']} ${styles['categories']}`}>
            <h4>Catégories</h4>
            <ul className={styles['items']}>
                {categories.map(({ id, name }, key) => {
                    const className = `${styles['item']} ${id === categoryActive ? styles['active'] : ''}`;
                    const onClick = () => handleSelectCategory(id);

                    return (
                        <li key={key} className={className} onClick={onClick}>
                            {name}
                        </li>
                    )
                })}
            </ul>
        </div>
        <div className={`${styles['block-wrapper']} ${styles['controls']}`}>
            <button>Se connecter</button>
        </div>
    </div>);
}