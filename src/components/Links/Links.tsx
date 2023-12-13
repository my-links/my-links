import clsx from 'clsx';
import MobileCategoriesModal from 'components/MobileCategoriesModal';
import CreateItem from 'components/QuickActions/CreateItem';
import EditItem from 'components/QuickActions/EditItem';
import RemoveItem from 'components/QuickActions/RemoveItem';
import SearchModal from 'components/SearchModal/SearchModal';
import { motion } from 'framer-motion';
import useActiveCategory from 'hooks/useActiveCategory';
import { useTranslation } from 'next-i18next';
import LinkTag from 'next/link';
import { BiSearchAlt } from 'react-icons/bi';
import quickActionStyles from '../QuickActions/quickactions.module.scss';
import LinkItem from './LinkItem';
import LinksFooter from './LinksFooter';
import styles from './links.module.scss';

interface LinksProps {
  isMobile: boolean;
}

export default function Links({ isMobile }: Readonly<LinksProps>) {
  const { t } = useTranslation('home');
  const { activeCategory } = useActiveCategory();

  if (activeCategory === null) {
    return (
      <div className={styles['no-category']}>
        <p>{t('home:select-category')}</p>
        <LinkTag href='/category/create'>{t('home:or-create-one')}</LinkTag>
      </div>
    );
  }

  const { id, name, links } = activeCategory;
  return (
    <div className={styles['links-wrapper']}>
      <h2 className={styles['category-header']}>
        {isMobile && <MobileCategoriesModal />}
        <span className={styles['category-name']}>
          {name}
          {links.length > 0 && (
            <span className={styles['links-count']}> — {links.length}</span>
          )}
        </span>
        <span className={styles['category-controls']}>
          <SearchModal childClassname={quickActionStyles['action']}>
            <BiSearchAlt />
          </SearchModal>
          <CreateItem
            type='link'
            categoryId={id}
          />
          <EditItem
            type='category'
            id={id}
          />
          <RemoveItem
            type='category'
            id={id}
          />
        </span>
      </h2>
      {links.length !== 0 ? (
        <ul className={clsx(styles['links'], 'reset')}>
          {links.map((link, index) => (
            <LinkItem
              link={link}
              index={index}
              key={link.id}
            />
          ))}
        </ul>
      ) : (
        <div className={styles['no-link']}>
          <motion.p
            key={id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              duration: 0.01,
            }}
            dangerouslySetInnerHTML={{
              __html: t('home:no-link', { name } as any, {
                interpolation: { escapeValue: false },
              }),
            }}
          />
          <LinkTag href={`/link/create?categoryId=${id}`}>
            {t('common:link.create')}
          </LinkTag>
        </div>
      )}
      <LinksFooter />
    </div>
  );
}
