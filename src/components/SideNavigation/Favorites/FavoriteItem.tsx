import LinkFavicon from 'components/Links/LinkFavicon';
import LinkTag from 'next/link';
import { LinkWithCategory } from 'types';
import styles from './favorites.module.scss';

export default function FavoriteItem({
  link,
}: Readonly<{
  link: LinkWithCategory;
}>): JSX.Element {
  const { name, url, category } = link;
  return (
    <li className={styles['item']}>
      <LinkTag
        href={url}
        target={'_blank'}
        rel={'noreferrer'}
        title={name}
      >
        <LinkFavicon
          url={url}
          size={24}
          noMargin
        />
        <span className={styles['link-name']}>{name}</span>
        <span className={styles['category']}> - {category.name}</span>
      </LinkTag>
    </li>
  );
}
