import { motion } from 'framer-motion';
import useIsMobile from 'hooks/useIsMobile';
import { CSSProperties, ReactNode } from 'react';
import LangSelector from './LangSelector';

export default function PageTransition({
  className,
  children,
  style = {},
  hideLangageSelector = false,
}: {
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
  hideLangageSelector?: boolean;
}) {
  const isMobile = useIsMobile();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'tween' }}
      style={style}
    >
      {children}
      {!hideLangageSelector && !isMobile && (
        <div className='lang-selector'>
          <LangSelector />
        </div>
      )}
    </motion.div>
  );
}
