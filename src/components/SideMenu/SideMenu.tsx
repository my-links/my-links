import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useSwipeable } from 'react-swipeable';
import styles from './side-menu.module.scss';

interface SideMenuProps {
  close?: (...args: any) => void;
  children: ReactNode;
}

export default function SideMenu({ close, children }: Readonly<SideMenuProps>) {
  const handlers = useSwipeable({
    trackMouse: true,
    onSwipedLeft: close,
  });

  const handleWrapperClick = (event) =>
    event.target.classList?.[0] === styles['side-menu-wrapper'] &&
    close &&
    close();

  return createPortal(
    <motion.div
      className={styles['side-menu-wrapper']}
      onClick={handleWrapperClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.1, delay: 0.1 } }}
      {...handlers}
    >
      <motion.div
        className={styles['side-menu-container']}
        initial={{ opacity: 0, x: '-100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '-100%', transition: { duration: 0.1 } }}
        transition={{ type: 'tween' }}
      >
        {children}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
