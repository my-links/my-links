import styles from '../../styles/categories.module.scss';

export default function Categories({ categories, favorites, handleSelectCategory, categoryActive }) {
    return (<div className={styles['categories-wrapper']}>
        <div className={styles['block-wrapper']}>
            <h4>Favoris</h4>
            <ul className={styles['favorites']}>
                {favorites.map(({ name, category }, key) => {
                    const catName = categories.find(c => c.id === category).name;
                    return <li key={key} className={styles['item']}>
                        {name} <span className={styles['category']}>- {catName}</span>
                    </li>;
                })}
            </ul>
        </div>
        <div className={styles['block-wrapper']}>
            <h4>Catégories</h4>
            <ul className={styles['categories']}>
                {categories.map(({ id, name }, key) => (
                    <li 
                        key={key} 
                        className={id === categoryActive ? styles['active'] : null} 
                        onClick={() => handleSelectCategory(id)}
                    >
                        {name} {id === categoryActive ? '(active)' : ''}
                    </li>
                ))}
            </ul>
        </div>
    </div>);
}