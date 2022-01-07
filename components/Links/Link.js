import { useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

import styles from '../../styles/links.module.scss';

export default function Link({ category,  setCategoryActive, refCategoryActive }) {
    const { ref, inView } = useInView({ threshold: .5 });
    const { id, name, links, ref: refCategory } = category;

    useEffect(() => inView ? setCategoryActive(id) : null, [id, inView, setCategoryActive]);

    const setRefs = useCallback((node) => {
        refCategory.current = node;
        refCategoryActive.current = node;
        ref(node);
    }, [ref, refCategoryActive, refCategory]);

    return (
        <div className={styles['link-block']} ref={setRefs}>
            <h2>{name}</h2>
            <ul className={styles['links']}>
                {links.map(({ name }, key2) => (
                    <li key={key2} className={styles['item']}>{name}</li>
                ))}
            </ul>
        </div>
    );
}