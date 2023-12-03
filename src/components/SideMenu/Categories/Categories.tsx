import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import { Category } from 'types';
import CategoryItem from './CategoryItem';
import styles from './categories.module.scss';
import clsx from 'clsx';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface CategoriesProps {
  categories: Category[];
  categoryActive: Category;
  handleSelectCategory: (category: Category) => void;
  moveCategory: (previousIndex: number, nextIndex: number) => void;
}

export default function Categories({
  categories,
  categoryActive,
  handleSelectCategory,
  moveCategory,
}: CategoriesProps) {
  const { t } = useTranslation();
  const linksCount = useMemo(
    () => categories.reduce((acc, current) => (acc += current.links.length), 0),
    [categories],
  );

  return (
    <div className={styles['categories']}>
      <h4>
        {t('common:category.categories')} • {linksCount}
      </h4>
      <DndProvider backend={HTML5Backend}>
        <ul className={clsx(styles['items'], 'reset')}>
          {categories.map((category, index) => (
            <CategoryItem
              category={category}
              categoryActive={categoryActive}
              handleSelectCategory={handleSelectCategory}
              moveCategory={moveCategory}
              key={category.id}
              index={index}
            />
          ))}
        </ul>
      </DndProvider>
    </div>
  );
}
