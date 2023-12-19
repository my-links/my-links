import ButtonLink from 'components/ButtonLink';
import SearchModal from 'components/SearchModal/SearchModal';
import PATHS from 'constants/paths';
import useActiveCategory from 'hooks/useActiveCategory';
import { useTranslation } from 'next-i18next';
import styles from './side-nav.module.scss';

export default function NavigationLinks() {
  const { t } = useTranslation();
  const { activeCategory } = useActiveCategory();

  return (
    <div className={styles['menu-controls']}>
      <div className={styles['action']}>
        <SearchModal disableHotkeys>{t('common:search')}</SearchModal>
        <kbd>S</kbd>
      </div>
      <div className={styles['action']}>
        <ButtonLink href={PATHS.CATEGORY.CREATE}>
          {t('common:category.create')}
        </ButtonLink>
        <kbd>C</kbd>
      </div>
      <div className={styles['action']}>
        <ButtonLink
          href={`${PATHS.LINK.CREATE}?categoryId=${activeCategory.id}`}
        >
          {t('common:link.create')}
        </ButtonLink>
        <kbd>L</kbd>
      </div>
    </div>
  );
}
