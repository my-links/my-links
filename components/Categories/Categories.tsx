import styles from '../../styles/home/categories.module.scss';
import { Category } from '../../types';

interface CategoriesProps {
    categories: Category[];
    categoryActive: Category;
    handleSelectCategory: (category: Category) => void;
}
export default function Categories({ categories, categoryActive, handleSelectCategory }: CategoriesProps) {
    return (
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