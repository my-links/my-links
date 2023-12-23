import ButtonLink from 'components/ButtonLink';
import Modal from 'components/Modal/Modal';
import TextBox from 'components/TextBox';
import * as Keys from 'constants/keys';
import { GOOGLE_SEARCH_URL } from 'constants/search-urls';
import { AnimatePresence } from 'framer-motion';
import useActiveCategory from 'hooks/useActiveCategory';
import useAutoFocus from 'hooks/useAutoFocus';
import useCategories from 'hooks/useCategories';
import useGlobalHotkeys from 'hooks/useGlobalHotkeys';
import { useLocalStorage } from 'hooks/useLocalStorage';
import useModal from 'hooks/useModal';
import useQueryParam from 'hooks/useQueryParam';
import useSearchItem from 'hooks/useSearchItem';
import { useTranslation } from 'next-i18next';
import { FormEvent, ReactNode, useCallback, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { BsSearch } from 'react-icons/bs';
import { SearchResult } from 'types/types';
import LabelSearchWithGoogle from './LabelSearchWithGoogle';
import { SearchFilter } from './SearchFilter';
import SearchList from './SearchList';
import styles from './search.module.scss';

interface SearchModalProps {
  noHeader?: boolean;
  children: ReactNode;
  childClassname?: string;
}

function SearchModal({
  noHeader = true,
  children,
  childClassname = '',
}: Readonly<SearchModalProps>) {
  const { t } = useTranslation();
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
  const { queryParam, clearQuery } = useQueryParam('q');
  const [searchTerm, setSearchTerm] = useState<string>(queryParam);
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);

  const searchModal = useModal(!!searchTerm);

  useEffect(
    () => setGlobalHotkeysEnabled(!searchModal.isShowing),
    [searchModal.isShowing, setGlobalHotkeysEnabled],
  );

  const handleCloseModal = useCallback(() => {
    searchModal.close();
    clearQuery();
    setSearchTerm('');
  }, [searchModal, clearQuery]);

  const searchItemsResult = useSearchItem({
    searchTerm,
    disableLinks: !canSearchLink,
    disableCategories: !canSearchCategory,
  });

  const handleSearchInputChange = (value: string) => setSearchTerm(value);
  const handleCanSearchLink = (checked: boolean) => setCanSearchLink(checked);
  const handleCanSearchCategory = (checked: boolean) =>
    setCanSearchCategory(checked);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleCloseModal();

      if (searchItemsResult.length === 0) {
        return window.open(GOOGLE_SEARCH_URL + encodeURI(searchTerm.trim()));
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
      searchItemsResult.length,
      searchTerm,
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
                  value={searchTerm}
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
              {searchTerm.length > 0 && (
                <SearchList
                  items={searchItemsResult}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  noItem={<LabelSearchWithGoogle />}
                  closeModal={handleCloseModal}
                />
              )}
              <button
                type='submit'
                disabled={searchTerm.length === 0}
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
