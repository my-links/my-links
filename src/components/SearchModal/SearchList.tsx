import clsx from 'clsx';
import * as Keys from 'constants/keys';
import { useTranslation } from 'next-i18next';
import { ReactNode, useEffect, useMemo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { SearchResult } from 'types/types';
import { groupItemBy } from 'utils/array';
import SearchListItem from './SearchListItem';
import styles from './search.module.scss';

const isActiveItem = (item: SearchResult, otherItem: SearchResult) =>
  item?.id === otherItem?.id && item?.type === otherItem?.type;
export default function SearchList({
  items,
  selectedItem,
  setSelectedItem,
  noItem,
  closeModal,
}: {
  items: SearchResult[];
  selectedItem: SearchResult;
  setSelectedItem: (item: SearchResult) => void;
  noItem?: ReactNode;
  closeModal: () => void;
}) {
  const searchItemsGrouped = useMemo(
    () => groupItemBy(items, 'category.name'),
    [items],
  );
  const groupedItems = useMemo<any>(
    () => Object.entries(searchItemsGrouped),
    [searchItemsGrouped],
  );

  const selectedItemIndex = useMemo<number>(
    () => items.findIndex((item) => isActiveItem(item, selectedItem)),
    [items, selectedItem],
  );

  useHotkeys(
    Keys.ARROW_UP,
    () => setSelectedItem(items[selectedItemIndex - 1]),
    {
      enableOnFormTags: ['INPUT'],
      enabled: items.length > 1 && selectedItemIndex !== 0,
      preventDefault: true,
    },
  );
  useHotkeys(
    Keys.ARROW_DOWN,
    () => setSelectedItem(items[selectedItemIndex + 1]),
    {
      enableOnFormTags: ['INPUT'],
      enabled: items.length > 1 && selectedItemIndex !== items.length - 1,
      preventDefault: true,
    },
  );

  useEffect(() => {
    setSelectedItem(items[0]);
  }, [items, setSelectedItem]);

  return (
    <ul className={clsx(styles['search-list'], 'reset')}>
      {groupedItems.length > 0 ? (
        groupedItems.map(([key, items]) => (
          <li key={`${key}-${key}`}>
            <span>{typeof key === 'undefined' ? '-' : key}</span>
            <ul className='reset'>
              {items.map((item) => (
                <SearchListItem
                  item={item}
                  selected={isActiveItem(item, selectedItem)}
                  closeModal={closeModal}
                  key={item.id}
                />
              ))}
            </ul>
          </li>
        ))
      ) : noItem ? (
        noItem
      ) : (
        <LabelNoItem />
      )}
    </ul>
  );
}

function LabelNoItem() {
  const { t } = useTranslation('home');
  return <i className={styles['no-item']}>{t('common:no-item-found')}</i>;
}
