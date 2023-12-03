import type { Identifier, XYCoord } from 'dnd-core';
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

export interface CardProps {
  id: any;
  text: string;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export default function CategoryItem({
  category,
  categoryActive,
  handleSelectCategory,
  moveCategory,
  index,
}: CategoryItemProps): JSX.Element {
  const ref = useRef<HTMLLIElement>();
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: 'category',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveCategory(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'category',
    item: () => {
      return { id: category.id, index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));
  const className = `${styles['item']} ${
    category.id === categoryActive.id ? styles['active'] : ''
  }`;
  const onClick = () => handleSelectCategory(category);

  useEffect(() => {
    if (category.id === categoryActive.id) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [category.id, categoryActive.id]);

  const opacity = isDragging ? 0 : 1;
  return (
    <motion.li
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 25,
        delay: index * 0.02,
        duration: 200,
      }}
      className={className}
      ref={ref}
      onClick={onClick}
      style={{
        cursor: 'move',
        display: 'flex',
        alignItems: 'center',
        gap: '.25em',
        transition: 'none',
        opacity,
      }}
      title={category.name}
      data-handler-id={handlerId}
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
