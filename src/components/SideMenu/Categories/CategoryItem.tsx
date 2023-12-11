import clsx from 'clsx';
import PATHS from 'constants/paths';
import { motion } from 'framer-motion';
import useActiveCategory from 'hooks/useActiveCategory';
import useCategories from 'hooks/useCategories';
import { makeRequest } from 'lib/request';
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

  const ref = useRef<HTMLLIElement>();

  const sendMoveCategoryRequest = useCallback(
    (category: CategoryWithLinks, nextId?: number) => {
      makeRequest({
        url: `${PATHS.API.CATEGORY}/${category.id}`,
        method: 'PUT',
        body: {
          name: category.name,
          nextId,
        },
      })
        .then(() => {
          setCategories((prevCategories) => {
            const categories = [...prevCategories];
            const categoryIndex = categories.findIndex(
              (c) => c.id === category.id,
            );
            categories[categoryIndex] = {
              ...categories[categoryIndex],
              nextId,
            };
            return categories;
          });
        })
        .catch(console.error);
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
        <span className={styles['name']}>{category.name}</span>
        <span className={styles['links-count']}>— {category.links.length}</span>
      </div>
    </motion.li>
  );
}
