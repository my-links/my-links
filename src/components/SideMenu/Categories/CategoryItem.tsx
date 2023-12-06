import clsx from 'clsx';
import type { XYCoord } from 'dnd-core';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { AiFillFolderOpen, AiOutlineFolder } from 'react-icons/ai';
import { Category } from 'types';
import styles from './categories.module.scss';

interface CategoryItemProps {
  category: Category;
  categoryActive: Category;
  handleSelectCategory: (category: Category) => void;
  moveCategory: (previousIndex: number, nextIndex: number) => void;
  index: number;
}

export default function CategoryItem({
  category,
  categoryActive,
  handleSelectCategory,
  moveCategory,
  index,
}: CategoryItemProps): JSX.Element {
  const ref = useRef<HTMLLIElement>();
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

      moveCategory(dragItem.index, index);
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

  const onClick = () => handleSelectCategory(category);

  useEffect(() => {
    if (category.id === categoryActive.id) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [category.id, categoryActive.id]);

  drag(drop(ref));

  const className = clsx(
    styles['item'],
    category.id === categoryActive.id && styles['active'],
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
      {category.id === categoryActive.id ? (
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
