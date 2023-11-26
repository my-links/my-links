import LinkTag from 'next/link';
import { AiOutlineFolder } from 'react-icons/ai';

import LinkFavicon from 'components/Links/LinkFavicon';
import { SearchItem } from 'types';

import { useEffect, useId, useRef } from 'react';
import styles from './search.module.scss';

export default function SearchListItem({
  item,
  selected,
  closeModal,
}: {
  item: SearchItem;
  selected: boolean;
  closeModal: () => void;
}) {
  const id = useId();
  const ref = useRef<HTMLLIElement>(null);

  const { name, type, url } = item;

  useEffect(() => {
    if (selected) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selected]);

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
        onClick={closeModal}
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
        <span>{name}</span>
      </LinkTag>
    </li>
  );
}
