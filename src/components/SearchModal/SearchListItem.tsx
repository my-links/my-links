import LinkTag from 'next/link';
import { AiOutlineFolder } from 'react-icons/ai';

import LinkFavicon from 'components/Links/LinkFavicon';
import { SearchItem } from 'types';

import useActiveCategory from 'hooks/useActiveCategory';
import useCategories from 'hooks/useCategories';
import { useEffect, useId, useRef } from 'react';
import styles from './search.module.scss';

export default function SearchListItem({
  item,
  selected,
  closeModal,
}: Readonly<{
  item: SearchItem;
  selected: boolean;
  closeModal: () => void;
}>) {
  const id = useId();
  const ref = useRef<HTMLLIElement>(null);
  const { categories } = useCategories();
  const { setActiveCategory } = useActiveCategory();

  const { name, type, url } = item;

  useEffect(() => {
    if (selected) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selected]);

  const handleClick = (event) => {
    if (item.type === 'category') {
      event.preventDefault();
      const category = categories.find((c) => c.id === item.id);
      setActiveCategory(category);
    }
    closeModal();
  };

  return (
    <li
      className={
        styles['search-item'] + (selected ? ` ${styles['selected']}` : '')
      }
      ref={ref}
      key={id}
      title={name}
    >
      <LinkTag
        href={url}
        target='_blank'
        rel='no-referrer'
        onClick={handleClick}
      >
        {type === 'link' ? (
          <LinkFavicon
            url={item.url}
            noMargin
            size={24}
          />
        ) : (
          <AiOutlineFolder size={24} />
        )}
        {name}
      </LinkTag>
    </li>
  );
}
