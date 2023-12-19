import clsx from 'clsx';
import useFavorites from 'hooks/useFavorites';
import { useTranslation } from 'next-i18next';
import FavoriteItem from './FavoriteItem';
import styles from './favorites.module.scss';

export default function Favorites() {
  const { t } = useTranslation();
  const { favorites } = useFavorites();

  return (
    favorites.length !== 0 && (
      <div className={styles['favorites']}>
        <h4>{t('common:favorite')}</h4>
        <ul className={clsx(styles['items'], 'reset')}>
          {favorites.map((link) => (
            <FavoriteItem
              link={link}
              key={link.id}
            />
          ))}
        </ul>
      </div>
    )
  );
}
