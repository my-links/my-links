import { Category } from '@prisma/client';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import styles from '../links.module.scss';

export default function NoLinkItem({
  categoryId,
  categoryName,
}: {
  categoryId: Category['id'];
  categoryName: Category['name'];
}) {
  const { t } = useTranslation();
  return (
    <div className={styles['no-link']}>
      <motion.p
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          duration: 0.01,
        }}
        dangerouslySetInnerHTML={{
          __html: t('home:no-link', { name: categoryName } as any, {
            interpolation: { escapeValue: false },
          }),
        }}
      />
      <Link href={`/link/create?categoryId=${categoryId}`}>
        {t('common:link.create')}
      </Link>
    </div>
  );
}
