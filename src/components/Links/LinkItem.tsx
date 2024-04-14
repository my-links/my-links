import ExternalLink from 'components/ExternalLink';
import EditItem from 'components/QuickActions/EditItem';
import FavoriteItem from 'components/QuickActions/FavoriteItem';
import RemoveItem from 'components/QuickActions/RemoveItem';
import PATHS from 'constants/paths';
import { motion } from 'framer-motion';
import useCategories from 'hooks/useCategories';
import { makeRequest } from 'lib/request';
import { useCallback } from 'react';
import { AiFillStar } from 'react-icons/ai';
import { LinkWithCategory } from 'types';
import LinkFavicon from './LinkFavicon';
import styles from './links.module.scss';

export default function LinkItem({
  link,
  index,
  showUserControls = false,
}: {
  link: LinkWithCategory;
  index: number;
  showUserControls: boolean;
}) {
  const { id, name, url, description, favorite } = link;
  const { categories, setCategories } = useCategories();

  const toggleFavorite = useCallback(
    (linkId: LinkWithCategory['id']) => {
      let linkIndex = 0;
      const categoryIndex = categories.findIndex(({ links }) => {
        const lIndex = links.findIndex((l) => l.id === linkId);
        if (lIndex !== -1) {
          linkIndex = lIndex;
        }
        return lIndex !== -1;
      });

      const link = categories[categoryIndex].links[linkIndex];
      const categoriesCopy = [...categories];
      categoriesCopy[categoryIndex].links[linkIndex] = {
        ...link,
        favorite: !link.favorite,
      };

      setCategories(categoriesCopy);
    },
    [categories, setCategories],
  );

  const onFavorite = () => {
    makeRequest({
      url: `${PATHS.API.LINK}/${link.id}`,
      method: 'PUT',
      body: {
        name,
        url,
        favorite: !favorite,
        categoryId: link.category.id,
      },
    })
      .then(() => toggleFavorite(link.id))
      .catch(console.error);
  };

  return (
    <motion.li
      className={styles['link']}
      key={id}
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: index * 0.05,
      }}
    >
      <div className={styles['link-header']}>
        <LinkFavicon url={url} />
        <ExternalLink
          href={url}
          className='reset'
        >
          <span className={styles['link-name']}>
            {name}{' '}
            {showUserControls && favorite && <AiFillStar color='#ffc107' />}
          </span>
          <LinkItemURL url={url} />
        </ExternalLink>
        {showUserControls && (
          <div className={styles['controls']}>
            <FavoriteItem
              isFavorite={favorite}
              onClick={onFavorite}
            />
            <EditItem
              type='link'
              id={id}
            />
            <RemoveItem
              type='link'
              id={id}
            />
          </div>
        )}
      </div>
      {description && (
        <div className={styles['link-description']}>{description}</div>
      )}
    </motion.li>
  );
}

function LinkItemURL({ url }: { url: LinkWithCategory['url'] }) {
  try {
    const { origin, pathname, search } = new URL(url);
    let text = '';

    if (pathname !== '/') {
      text += pathname;
    }

    if (search !== '') {
      if (text === '') {
        text += '/';
      }
      text += search;
    }

    return (
      <span className={styles['link-url']}>
        {origin}
        <span className={styles['url-pathname']}>{text}</span>
      </span>
    );
  } catch (error) {
    console.error('error', error);
    return <span className={styles['link-url']}>{url}</span>;
  }
}
