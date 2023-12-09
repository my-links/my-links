import ButtonLink from 'components/ButtonLink';
import Modal from 'components/Modal/Modal';
import TextBox from 'components/TextBox';
import * as Keys from 'constants/keys';
import PATHS from 'constants/paths';
import { GOOGLE_SEARCH_URL } from 'constants/search-urls';
import { AnimatePresence } from 'framer-motion';
import useActiveCategory from 'hooks/useActiveCategory';
import useAutoFocus from 'hooks/useAutoFocus';
import useCategories from 'hooks/useCategories';
import useGlobalHotkeys from 'hooks/useGlobalHotkeys';
import { useLocalStorage } from 'hooks/useLocalStorage';
import useModal from 'hooks/useModal';
import { useTranslation } from 'next-i18next';
import { FormEvent, ReactNode, useCallback, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { BsSearch } from 'react-icons/bs';
import { CategoryWithRelations, LinkWithRelations, SearchItem } from 'types';
import LabelSearchWithGoogle from './LabelSearchWithGoogle';
import SearchList from './SearchList';
import styles from './search.module.scss';

export default function SearchModal({
  noHeader = true,
  children,
  childClassname = '',
}: {
  noHeader?: boolean;
  children: ReactNode;
  childClassname?: string;
}) {
  const { t } = useTranslation();
  const autoFocusRef = useAutoFocus();
  const searchModal = useModal();

  const { categories } = useCategories();
  const { setActiveCategory } = useActiveCategory();
  const {
    globalHotkeysEnabled: globalHotkeysEnable,
    setGlobalHotkeysEnabled: setGlobalHotkeysEnable,
  } = useGlobalHotkeys();

  setGlobalHotkeysEnable(!searchModal.isShowing);

  const handleCloseModal = useCallback(() => {
    searchModal.close();
    setSearch('');
  }, [searchModal]);

  useHotkeys(
    Keys.OPEN_SEARCH_KEY,
    (event) => {
      event.preventDefault();
      searchModal.open();
    },
    { enabled: globalHotkeysEnable },
  );
  useHotkeys(Keys.CLOSE_SEARCH_KEY, handleCloseModal, {
    enabled: searchModal.isShowing,
    enableOnFormTags: ['INPUT'],
  });

  const searchItemBuilder = (
    item: CategoryWithRelations | LinkWithRelations,
    type: SearchItem['type'],
  ): SearchItem => ({
    id: item.id,
    name: item.name,
    url:
      type === 'link'
        ? (item as LinkWithRelations).url
        : `${PATHS.HOME}?categoryId=${item.id}`,
    type,
    category:
      type === 'link' ? (item as LinkWithRelations).category : undefined,
  });

  const itemsSearch = useMemo<SearchItem[]>(() => {
    return categories.reduce((acc, category) => {
      const categoryItem = searchItemBuilder(category, 'category');
      const items: SearchItem[] = category.links.map((link) =>
        searchItemBuilder(link, 'link'),
      );
      return [...acc, ...items, categoryItem];
    }, [] as SearchItem[]);
  }, [categories]);

  const [canSearchLink, setCanSearchLink] = useLocalStorage(
    'search-link',
    true,
  );
  const [canSearchCategory, setCanSearchCategory] = useLocalStorage(
    'search-category',
    false,
  );

  const [search, setSearch] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<SearchItem | null>(
    itemsSearch[0],
  );

  const canSubmit = useMemo<boolean>(() => search.length > 0, [search]);

  // TODO: extract this code into utils function
  const itemsCompletion = useMemo(
    () =>
      search.length === 0
        ? []
        : itemsSearch.filter(
            (item) =>
              ((item.type === 'category' && canSearchCategory) ||
                (item.type === 'link' && canSearchLink)) &&
              item.name
                .toLocaleLowerCase()
                .includes(search.toLocaleLowerCase().trim()),
          ),
    [canSearchCategory, canSearchLink, itemsSearch, search],
  );

  const handleSearchInputChange = useCallback(
    (value: string) => setSearch(value),
    [],
  );

  const handleCanSearchLink = (checked: boolean) => setCanSearchLink(checked);
  const handleCanSearchCategory = (checked: boolean) =>
    setCanSearchCategory(checked);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleCloseModal();

      if (itemsCompletion.length === 0) {
        return window.open(GOOGLE_SEARCH_URL + encodeURI(search.trim()));
      }

      if (!selectedItem) return;

      const category = categories.find((c) => c.id === selectedItem.id);
      if (selectedItem.type === 'category' && category) {
        return setActiveCategory(category);
      }

      window.open(selectedItem.url);
    },
    [
      categories,
      handleCloseModal,
      itemsCompletion.length,
      search,
      selectedItem,
      setActiveCategory,
    ],
  );

  return (
    <>
      <ButtonLink
        className={childClassname}
        onClick={searchModal.open}
      >
        {children}
      </ButtonLink>
      <AnimatePresence>
        {searchModal.isShowing && (
          <Modal
            close={handleCloseModal}
            noHeader={noHeader}
            padding={'0'}
          >
            <form
              onSubmit={handleSubmit}
              className={styles['search-form']}
            >
              <div className={styles['search-input-wrapper']}>
                <label htmlFor='search'>
                  <BsSearch size={24} />
                </label>
                <TextBox
                  name='search'
                  onChangeCallback={handleSearchInputChange}
                  value={search}
                  placeholder={t('common:search')}
                  innerRef={autoFocusRef}
                  fieldClass={styles['search-input-field']}
                  inputClass={'reset'}
                />
              </div>
              <SearchFilter
                canSearchLink={canSearchLink}
                setCanSearchLink={handleCanSearchLink}
                canSearchCategory={canSearchCategory}
                setCanSearchCategory={handleCanSearchCategory}
              />
              {search.length > 0 && (
                <SearchList
                  items={itemsCompletion}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  noItem={<LabelSearchWithGoogle />}
                  closeModal={handleCloseModal}
                />
              )}
              <button
                type='submit'
                disabled={!canSubmit}
                style={{ display: 'none' }}
              >
                {t('common:confirm')}
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

function SearchFilter({
  canSearchLink,
  setCanSearchLink,
  canSearchCategory,
  setCanSearchCategory,
}: {
  canSearchLink: boolean;
  setCanSearchLink: (value: boolean) => void;
  canSearchCategory: boolean;
  setCanSearchCategory: (value: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: 'flex',
        gap: '1em',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1em',
      }}
    >
      <div style={{ display: 'flex', gap: '.25em' }}>
        <input
          type='checkbox'
          name='filter-link'
          id='filter-link'
          onChange={({ target }) => setCanSearchLink(target.checked)}
          checked={canSearchLink}
        />
        <label htmlFor='filter-link'>{t('common:link.links')}</label>
      </div>
      <div style={{ display: 'flex', gap: '.25em' }}>
        <input
          type='checkbox'
          name='filter-category'
          id='filter-category'
          onChange={({ target }) => setCanSearchCategory(target.checked)}
          checked={canSearchCategory}
        />
        <label htmlFor='filter-category'>
          {t('common:category.categories')}
        </label>
      </div>
    </div>
  );
}
