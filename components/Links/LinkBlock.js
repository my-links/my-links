import { useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

import Link from './Link';

import styles from '../../styles/links.module.scss';

export default function LinkBlock({ category,  setCategoryActive, refCategoryActive }) {
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
                {links.map((link, key2) => (
                    <Link key={key2} link={link} />
                ))}
            </ul>
        </div>
    );
}