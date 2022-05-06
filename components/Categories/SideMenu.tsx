import { Session } from 'next-auth';
import LinkTag from 'next/link';

import Categories from './Categories';
import Favorites from './Favorites';
import UserCard from './UserCard';

import styles from '../../styles/home/categories.module.scss';
import { Category, Link } from '../../types';

interface SideMenuProps {
    categories: Category[];
    favorites: Link[];
    handleSelectCategory: (category: Category) => void;
    categoryActive: Category;
    session: Session;
}
export default function SideMenu({
    categories,
    favorites,
    handleSelectCategory,
    categoryActive,
    session
}: SideMenuProps) {
    return (<div className={styles['categories-wrapper']}>
        <Favorites favorites={favorites} />
        <Categories
            categories={categories}
            categoryActive={categoryActive}
            handleSelectCategory={handleSelectCategory}
        />
        <MenuControls />
        <UserCard session={session} />
    </div>);
}

function MenuControls() {
    return (
        <div className={styles['controls']}>
            <LinkTag href={'/category/create'}>
                <a>Créer categorie</a>
            </LinkTag>
            <LinkTag href={'/link/create'}>
                <a>Créer lien</a>
            </LinkTag>
        </div>
    )
}