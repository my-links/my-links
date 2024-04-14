import { CategoryWithLinks } from 'types/types';
import styles from './category-header.module.scss';
import VisibilityBadge from 'components/Visibility/Visibility';
import { useTranslation } from 'next-i18next';

export default function CategoryHeader({
  activeCategory: { name, links, visibility },
}: {
  activeCategory: CategoryWithLinks;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles['category-name-wrapper']}>
      <div className={styles['category-name']}>{name}</div>
      {links.length > 0 && (
        <span className={styles['links-count']}> — {links.length}</span>
      )}
      <VisibilityBadge
        label={t('common:category.visibility')}
        visibility={visibility}
      />
    </div>
  );
}
