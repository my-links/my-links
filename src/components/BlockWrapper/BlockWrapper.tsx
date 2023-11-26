import { CSSProperties, ReactNode } from 'react';

import styles from './block-wrapper.module.scss';

interface BlockWrapperProps {
  children: ReactNode;
  style?: CSSProperties;
}

export default function BlockWrapper({ children, style }: BlockWrapperProps) {
  return (
    <section
      className={styles['block-wrapper']}
      style={style}
    >
      {children}
    </section>
  );
}
