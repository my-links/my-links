import LinkBlock from './LinkBlock';

import styles from '../../styles/links.module.scss';

export default function Links({ categories, setCategoryActive, refCategoryActive }) {
    return (<div className={styles['links-wrapper']}>
        {categories.map((category, key) => (
            <LinkBlock 
                key={key} 
                category={category} 
                setCategoryActive={setCategoryActive}
                refCategoryActive={refCategoryActive} 
            />
        ))}
    </div>);
}