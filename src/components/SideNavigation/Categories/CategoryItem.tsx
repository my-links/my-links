import clsx from 'clsx';
import VisibilityBadge from 'components/Visibility/Visibility';
import PATHS from 'constants/paths';
import { motion } from 'framer-motion';
import useActiveCategory from 'hooks/useActiveCategory';
import useCategories from 'hooks/useCategories';
import sortCategoriesByNextId from 'lib/category/sortCategoriesByNextId';
import { makeRequest } from 'lib/request';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { AiFillFolderOpen, AiOutlineFolder } from 'react-icons/ai';
import { CategoryWithLinks } from 'types';
import { arrayMove } from 'utils/array';
import styles from './categories.module.scss';

interface CategoryItemProps {
  category: CategoryWithLinks;
  index: number;
}

type CategoryDragItem = {
  categoryId: CategoryWithLinks['id'];
  index: number;
};

export default function CategoryItem({
  category,
  index,
}: Readonly<CategoryItemProps>): JSX.Element {
  const { activeCategory, setActiveCategory } = useActiveCategory();
  const { categories, setCategories } = useCategories();
  const { t } = useTranslation('common');

  const ref = useRef<HTMLLIElement>();

  const sendMoveCategoryRequest = useCallback(
    async (category: CategoryWithLinks, nextId?: number) => {
      if (category.id === nextId) return;

      await makeRequest({
        url: `${PATHS.API.CATEGORY}/${category.id}`,
        method: 'PUT',
        body: {
          name: category.name,
          nextId,
        },
      });
      setCategories((prevCategories) => {
        const categories = [...prevCategories];
        const categoryIndex = categories.findIndex((c) => c.id === category.id);

        const previousCategoryIndex = categories.findIndex(
          (c) => c.nextId === category.id,
        );
        const prevNextCategoryIndex = categories.findIndex(
          (c) => c.nextId === nextId,
        );

        categories[categoryIndex] = {
          ...categories[categoryIndex],
          nextId,
        };
        if (previousCategoryIndex !== -1) {
          categories[previousCategoryIndex] = {
            ...categories[previousCategoryIndex],
            nextId: category.nextId,
          };
        }
        if (prevNextCategoryIndex !== -1) {
          categories[prevNextCategoryIndex] = {
            ...categories[prevNextCategoryIndex],
            nextId: category.id,
          };
        }

        return sortCategoriesByNextId(categories);
      });
    },
    [setCategories],
  );
  const moveCategory = useCallback(
    (currentIndex: number, newIndex: number) => {
      setCategories((prevCategories: CategoryWithLinks[]) =>
        arrayMove(prevCategories, currentIndex, newIndex),
      );
    },
    [setCategories],
  );

  const [_, drop] = useDrop({
    accept: 'category',
    hover: (dragItem: CategoryDragItem) => {
      if (ref.current && dragItem.categoryId !== category.id) {
        moveCategory(dragItem.index, index);
        dragItem.index = index;
      }
    },
    drop: (item) => {
      const category = categories.find((c) => c.id === item.categoryId);
      const nextCategory = categories[item.index + 1];
      if (category.nextId === null && nextCategory?.id === undefined) return;
      if (category.nextId !== nextCategory?.id) {
        sendMoveCategoryRequest(category, nextCategory?.id ?? null);
      }
    },
  });

  const [{ opacity }, drag] = useDrag({
    type: 'category',
    item: () => ({ index, categoryId: category.id }),
    collect: (monitor: any) => ({
      opacity: monitor.isDragging() ? 0.1 : 1,
    }),
    end: (dragItem: CategoryDragItem, monitor) => {
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        moveCategory(dragItem.index, index);
      }
    },
  });

  useEffect(() => {
    if (category.id === activeCategory.id) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [category.id, activeCategory.id]);

  drag(drop(ref));

  return (
    <motion.li
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 25,
        delay: index * 0.02,
        duration: 200,
      }}
      className={clsx(
        styles['item'],
        category.id === activeCategory.id && styles['active'],
      )}
      style={{
        transition: 'none',
        opacity,
      }}
      onClick={() => setActiveCategory(category)}
      title={category.name}
      ref={ref}
    >
      {category.id === activeCategory.id ? (
        <AiFillFolderOpen size={24} />
      ) : (
        <AiOutlineFolder size={24} />
      )}

      <div className={styles['content']}>
        <div className={styles['name-wrapper']}>
          <span className={styles['name']}>{category.name}</span>
          <span className={styles['links-count']}>
            — {category.links.length}
          </span>
        </div>
        <VisibilityBadge
          label={t('common:category.visibility')}
          visibility={category.visibility}
        />
      </div>
    </motion.li>
  );
}
