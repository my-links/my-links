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
    (dragIndex: number, hoverIndex: number) => {
      setCategories((prevCategories: CategoryWithLinks[]) => {
        const categories = [...prevCategories];
        return arrayMove(categories, dragIndex, hoverIndex);
      });
    },
    [setCategories],
  );

  const [_, drop] = useDrop({
    accept: 'category',
    hover(dragItem: CategoryDragItem, monitor) {
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

      moveCategory(dragItem.index, index);
      dragItem.index = index;
    },
    drop(item) {
      sendMoveCategoryRequest(item.categoryId, item.index);
    },
  });

  const [{ opacity }, drag] = useDrag({
    type: 'category',
    item: () => ({ index, categoryId: category.id }),
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
        <span className={styles['links-count']}>
          — {category.links.length} ({index} - {category.nextId})
        </span>
      </div>
    </motion.li>
  );
}

function arrayMove(arr: any[], previousIndex: number, nextIndex: number) {
  if (nextIndex >= arr.length) {
    var k = nextIndex - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(nextIndex, 0, arr.splice(previousIndex, 1)[0]);
  return arr; // for testing
}
