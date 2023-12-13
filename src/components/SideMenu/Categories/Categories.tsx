import clsx from 'clsx';
import * as Keys from 'constants/keys';
import useActiveCategory from 'hooks/useActiveCategory';
import useCategories from 'hooks/useCategories';
import useGlobalHotkeys from 'hooks/useGlobalHotkeys';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useHotkeys } from 'react-hotkeys-hook';
import CategoryItem from './CategoryItem';
import styles from './categories.module.scss';

export default function Categories() {
  const { t } = useTranslation();
  const { categories } = useCategories();
  const { activeCategory, setActiveCategory } = useActiveCategory();
  const { globalHotkeysEnabled } = useGlobalHotkeys();

  const linksCount = useMemo(
    () => categories.reduce((acc, current) => (acc += current.links.length), 0),
    [categories],
  );

  useHotkeys(
    Keys.ARROW_UP,
    () => {
      const currentCategoryIndex = categories.findIndex(
        ({ id }) => id === activeCategory.id,
      );
      if (currentCategoryIndex === -1 || currentCategoryIndex === 0) return;

      setActiveCategory(categories[currentCategoryIndex - 1]);
    },
    { enabled: globalHotkeysEnabled },
  );

  useHotkeys(
    Keys.ARROW_DOWN,
    () => {
      const currentCategoryIndex = categories.findIndex(
        ({ id }) => id === activeCategory.id,
      );
      if (
        currentCategoryIndex === -1 ||
        currentCategoryIndex === categories.length - 1
      )
        return;

      setActiveCategory(categories[currentCategoryIndex + 1]);
    },
    { enabled: globalHotkeysEnabled },
  );

  return (
    <div className={styles['categories']}>
      <h4>
        {t('common:category.categories')} • {linksCount}
      </h4>
      <DndProvider backend={HTML5Backend}>
        <ListCategories />
      </DndProvider>
    </div>
  );
}

function ListCategories() {
  const [, drop] = useDrop(() => ({ accept: 'category' }));
  const { categories } = useCategories();

  return (
    <ul
      className={clsx(styles['items'], 'reset')}
      ref={drop}
    >
      {categories.map((category, index) => (
        <CategoryItem
          category={category}
          key={category.id}
          index={index}
        />
      ))}
    </ul>
  );
}
