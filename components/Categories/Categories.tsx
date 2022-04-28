import { signOut } from "next-auth/react"
import { Session } from 'next-auth';
import LinkTag from "next/link";
import Image from "next/image";

import styles from '../../styles/home/categories.module.scss';
import { Category, Link } from '../../types';

interface CategoryProps {
    categories: Category[];
    favorites: Link[];
    handleSelectCategory: (category: Category) => void;
    categoryActive: Category;
    session: Session;
}
export default function Categories({
    categories,
    favorites,
    handleSelectCategory,
    categoryActive,
    session
}: CategoryProps) {
    return (<div className={styles['categories-wrapper']}>
        <div className={`${styles['block-wrapper']} ${styles['favorites']}`}>
            <h4>Favoris</h4>
            <ul className={styles['items']}>
                {favorites.map((link, key) => (
                    <LinkFavorite
                        link={link}
                        key={key}
                    />
                ))}
            </ul>
        </div>
        <div className={`${styles['block-wrapper']} ${styles['categories']}`}>
            <h4>Catégories</h4>
            <ul className={styles['items']}>
                {categories.map((category, key) => (
                    <CategoryItem
                        category={category}
                        categoryActive={categoryActive}
                        handleSelectCategory={handleSelectCategory}
                        key={key}
                    />
                ))}
            </ul>
        </div>
        <div className={styles['controls']}>
            <LinkTag href={'/category/create'}>
                <a>Créer categorie</a>
            </LinkTag>
            <LinkTag href={'/link/create'}>
                <a>Créer lien</a>
            </LinkTag>
        </div>
        <div className={styles['user-card-wrapper']}>
            <div className={styles['user-card']}>
                <Image
                    src={session.user.image}
                    width={28}
                    height={28}
                    alt={`${session.user.name}'s avatar`}
                />
                {session.user.name}
            </div>
            <button onClick={() => signOut()} className={styles['disconnect-btn']}>
                Se déconnecter
            </button>
        </div>
    </div>);
}

function LinkFavorite({ link }: { link: Link; }): JSX.Element {
    const { name, url, category } = link;
    return (
        <li className={styles['item']}>
            <a href={url} target={'_blank'} rel={'noreferrer'}>
                {name} <span className={styles['category']}>- {category.name}</span>
            </a>
        </li>
    )
}

interface CategoryItemProps {
    category: Category;
    categoryActive: Category;
    handleSelectCategory: (category: Category) => void;
}
function CategoryItem({ category, categoryActive, handleSelectCategory }: CategoryItemProps): JSX.Element {
    const className = `${styles['item']} ${category.id === categoryActive.id ? styles['active'] : ''}`;
    const onClick = () => handleSelectCategory(category);

    return (
        <li className={className} onClick={onClick}>
            {category.name}<span className={styles['links-count']}> — {category.links.length}</span>
        </li>
    )
}