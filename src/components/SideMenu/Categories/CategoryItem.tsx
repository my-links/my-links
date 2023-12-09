import clsx from 'clsx';
import PATHS from 'constants/paths';
import type { XYCoord } from 'dnd-core';
import { motion } from 'framer-motion';
import useActiveCategory from 'hooks/useActiveCategory';
import useCategories from 'hooks/useCategories';
import { makeRequest } from 'lib/request';
import { useCallback, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { AiFillFolderOpen, AiOutlineFolder } from 'react-icons/ai';
import { CategoryWithLinks } from 'types';
import styles from './categories.module.scss';

interface CategoryItemProps {
  category: CategoryWithLinks;
  index: number;
}

export default function CategoryItem({
  category,
  index,
}: Readonly<CategoryItemProps>): JSX.Element {
  const { activeCategory, setActiveCategory } = useActiveCategory();
  const { categories, setCategories } = useCategories();

  const ref = useRef<HTMLLIElement>();

  const sendMoveCategoryRequest = useCallback(
    (categoryId: CategoryWithLinks['id'], newOrder: number) => {
      const category = categories.find((c) => c.id === categoryId);
      makeRequest({
        url: `${PATHS.API.CATEGORY}/${category.id}`,
        method: 'PUT',
        body: {
          name: category.name,
          order: newOrder,
        },
      }).catch(console.error);
    },
    [categories],
  );
  const moveCategory = useCallback(
    (
      dragIndex: number,
      hoverIndex: number,
      categoryId: CategoryWithLinks['id'],
    ) => {
      setCategories((prevCategories: CategoryWithLinks[]) => {
        const categories = [...prevCategories];
        const c = categories.find((c) => c.id === categoryId);
        console.log('previous', c.order);
        console.log('old', categoryId, hoverIndex);
        const sorted = updateCategoryOrder(categories, categoryId, hoverIndex);
        const a = sorted.find((c) => c.id === categoryId);
        console.log('new', a.id, a.order);
        return sorted;
      });
      sendMoveCategoryRequest(categoryId, hoverIndex);
    },
    [sendMoveCategoryRequest, setCategories],
  );

  const [_, drop] = useDrop({
    accept: 'category',
    hover(dragItem: { index: number }, monitor) {
      if (!ref.current || dragItem.index === index) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      if (
        (dragItem.index < index && hoverClientY < hoverMiddleY) ||
        (dragItem.index > index && hoverClientY > hoverMiddleY)
      ) {
        return;
      }

      console.log('drag', dragItem.index, 'current', index);
      moveCategory(dragItem.index, index, category.id);
      dragItem.index = index;
    },
  });

  const [{ opacity }, drag] = useDrag({
    type: 'category',
    item: () => ({ index }),
    collect: (monitor: any) => ({
      opacity: monitor.isDragging() ? 0.1 : 1,
    }),
  });

  const onClick = () => setActiveCategory(category);

  useEffect(() => {
    if (category.id === activeCategory.id) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [category.id, activeCategory.id]);

  drag(drop(ref));

  const className = clsx(
    styles['item'],
    category.id === activeCategory.id && styles['active'],
  );

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
      className={className}
      onClick={onClick}
      style={{
        cursor: 'move',
        transition: 'none',
        opacity,
      }}
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

function updateCategoryOrder(
  categories: CategoryWithLinks[],
  categoryId: number,
  newOrder: number,
): CategoryWithLinks[] {
  const categoryIndex = categories.findIndex((cat) => cat.id === categoryId);

  if (categoryIndex === -1) {
    // La catégorie avec l'ID spécifié n'a pas été trouvée
    return categories;
  }

  // Mettez à jour l'ordre de la catégorie spécifiée
  categories[categoryIndex].order = newOrder;

  // Mettez à jour l'ordre des catégories suivantes
  for (let i = categoryIndex + 1; i < categories.length; i++) {
    categories[i].order = newOrder + i - categoryIndex;
  }

  return categories;
}
