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
import { useRouter } from 'next/router';
import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { BsSearch } from 'react-icons/bs';
import { CategoryWithLinks, LinkWithCategory, SearchItem } from 'types/types';
import LabelSearchWithGoogle from './LabelSearchWithGoogle';
import { SearchFilter } from './SearchFilter';
import SearchList from './SearchList';
import styles from './search.module.scss';

interface SearchModalProps {
  noHeader?: boolean;
  children: ReactNode;
  childClassname?: string;
}

export default function SearchModal({
  noHeader = true,
  children,
  childClassname = '',
}: Readonly<SearchModalProps>) {
  const { t } = useTranslation();
  const router = useRouter();
  const autoFocusRef = useAutoFocus();
  const { categories } = useCategories();
  const { setActiveCategory } = useActiveCategory();
  const { globalHotkeysEnabled, setGlobalHotkeysEnabled } = useGlobalHotkeys();

  const searchQueryParam = (router.query.q as string) || '';
  const searchModal = useModal(
    !!searchQueryParam && typeof window !== 'undefined',
  );

  useEffect(
    () => setGlobalHotkeysEnabled(!searchModal.isShowing),
    [searchModal.isShowing, setGlobalHotkeysEnabled],
  );

  const handleCloseModal = useCallback(() => {
    searchModal.close();
    setSearch('');
    router.replace({
      query: undefined,
    });
  }, [router, searchModal]);

  useHotkeys(
    Keys.OPEN_SEARCH_KEY,
    (event) => {
      event.preventDefault();
      searchModal.open();
    },
    { enabled: globalHotkeysEnabled },
  );

  useHotkeys(Keys.CLOSE_SEARCH_KEY, handleCloseModal, {
    enabled: searchModal.isShowing,
    enableOnFormTags: ['INPUT'],
  });

  const searchItemBuilder = (
    item: CategoryWithLinks | LinkWithCategory,
    type: SearchItem['type'],
  ): SearchItem => ({
    id: item.id,
    name: item.name,
    url:
      type === 'link'
        ? (item as LinkWithCategory).url
        : `${PATHS.HOME}?categoryId=${item.id}`,
    type,
    category: type === 'link' ? (item as LinkWithCategory).category : undefined,
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
  const [search, setSearch] = useState<string>(searchQueryParam);
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

  const handleSearchInputChange = (value: string) => setSearch(value);

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
                  inputClass='reset'
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
