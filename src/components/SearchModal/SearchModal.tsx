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
import {
  CategoryWithLinks,
  LinkWithCategory,
  SearchItem,
  SearchResult,
} from 'types/types';
import LabelSearchWithGoogle from './LabelSearchWithGoogle';
import { SearchFilter } from './SearchFilter';
import SearchList from './SearchList';
import styles from './search.module.scss';

interface SearchModalProps {
  noHeader?: boolean;
  children: ReactNode;
  childClassname?: string;
}

function buildSearchItem(
  item: CategoryWithLinks | LinkWithCategory,
  type: SearchItem['type'],
): SearchItem {
  return {
    id: item.id,
    name: item.name,
    url:
      type === 'link'
        ? (item as LinkWithCategory).url
        : `${PATHS.HOME}?categoryId=${item.id}`,
    type,
    category: type === 'link' ? (item as LinkWithCategory).category : undefined,
  };
}

function formatSearchItem(
  item: SearchItem,
  searchTerm: string,
): SearchResult | null {
  const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
  const lowerCaseName = item.name.toLowerCase().trim();

  let currentIndex = 0;
  let formattedName = '';

  for (let i = 0; i < lowerCaseName.length; i++) {
    if (lowerCaseName[i] === lowerCaseSearchTerm[currentIndex]) {
      formattedName += `<b>${item.name[i]}</b>`;
      currentIndex++;
    } else {
      formattedName += item.name[i];
    }
  }

  if (currentIndex !== lowerCaseSearchTerm.length) {
    // Search term not fully matched
    return null;
  }

  return {
    id: item.id,
    name: <div dangerouslySetInnerHTML={{ __html: formattedName }} />,
    url: item.url,
    type: item.type,
    category: item.category,
  };
}

function SearchModal({
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
  const [canSearchLink, setCanSearchLink] = useLocalStorage(
    'search-link',
    true,
  );
  const [canSearchCategory, setCanSearchCategory] = useLocalStorage(
    'search-category',
    false,
  );
  const [search, setSearch] = useState<string>(
    (router.query.q as string) || '',
  );
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);

  const searchModal = useModal(!!search && typeof window !== 'undefined');

  useEffect(
    () => setGlobalHotkeysEnabled(!searchModal.isShowing),
    [searchModal.isShowing, setGlobalHotkeysEnabled],
  );

  const handleCloseModal = useCallback(() => {
    searchModal.close();
    setSearch('');
    if (!!search) {
      router.replace({
        query: undefined,
      });
    }
  }, [router, search, searchModal]);

  const itemsSearch = useMemo<SearchItem[]>(() => {
    return categories.reduce((acc, category) => {
      const categoryItem = buildSearchItem(category, 'category');
      const items: SearchItem[] = category.links.map((link) =>
        buildSearchItem(link, 'link'),
      );
      return [...acc, ...items, categoryItem];
    }, [] as SearchItem[]);
  }, [categories]);

  const itemsCompletion = useMemo(() => {
    return itemsSearch.reduce((acc, item) => {
      const formattedItem = formatSearchItem(item, search);

      if (
        (canSearchLink && item.type === 'link') ||
        (canSearchCategory && item.type === 'category')
      ) {
        return formattedItem ? [...acc, formattedItem] : acc;
      }

      return acc;
    }, [] as SearchResult[]);
  }, [itemsSearch, search, canSearchLink, canSearchCategory]);

  const canSubmit = useMemo<boolean>(() => search.length > 0, [search]);

  const handleSearchInputChange = useCallback(
    (value: string) => setSearch(value),
    [],
  );

  const handleCanSearchLink = useCallback(
    (checked: boolean) => setCanSearchLink(checked),
    [setCanSearchLink],
  );

  const handleCanSearchCategory = useCallback(
    (checked: boolean) => setCanSearchCategory(checked),
    [setCanSearchCategory],
  );

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

export default SearchModal;
