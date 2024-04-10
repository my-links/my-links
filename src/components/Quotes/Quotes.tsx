import { ReactNode } from 'react';
import styles from './quotes.module.scss';

const Quotes = ({ children }: { children: ReactNode }) => (
  <p className={styles['quotes']}>{children}</p>
);

export default Quotes;
