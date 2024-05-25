import styled from '@emotion/styled';
import { route } from '@izzyjs/route/client';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoIosSearch } from 'react-icons/io';
import Modal from '~/components/common/modal/modal';
import NoSearchResult from '~/components/dashboard/search/no_search_result';
import SearchResultList from '~/components/dashboard/search/search_result_list';
import { GOOGLE_SEARCH_URL } from '~/constants';
import useActiveCollection from '~/hooks/use_active_collection';
import useCollections from '~/hooks/use_collections';
import useToggle from '~/hooks/use_modal';
import useShortcut from '~/hooks/use_shortcut';
import { makeRequest } from '~/lib/request';
import { SearchResult } from '~/types/search';

const SearchInput = styled.input(({ theme }) => ({
  width: '100%',
  fontSize: '20px',
  color: theme.colors.font,
  backgroundColor: 'transparent',
  paddingLeft: 0,
  border: '1px solid transparent',
}));

interface SearchModalProps {
  openItem: any;
}

function SearchModal({ openItem: OpenItem }: SearchModalProps) {
  const { t } = useTranslation();
  const { collections } = useCollections();
  const { setActiveCollection } = useActiveCollection();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);

  const searchModal = useToggle(!!searchTerm);

  const handleCloseModal = useCallback(() => {
    searchModal.close();
    setSearchTerm('');
  }, [searchModal]);

  const handleSearchInputChange = (value: string) => setSearchTerm(value);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleCloseModal();

    if (results.length === 0) {
      return window.open(GOOGLE_SEARCH_URL + encodeURI(searchTerm.trim()));
    }

    if (!selectedItem) return;

    if (selectedItem.type === 'collection') {
      const collection = collections.find((c) => c.id === selectedItem.id);
      if (collection) {
        setActiveCollection(collection);
      }
      return;
    }

    window.open(selectedItem.url);
  };

  useShortcut('OPEN_SEARCH_KEY', searchModal.open, {
    enabled: !searchModal.isShowing,
  });
  useShortcut('ESCAPE_KEY', handleCloseModal, {
    enabled: searchModal.isShowing,
    disableGlobalCheck: true,
  });

  useEffect(() => {
    if (searchTerm.trim() === '') {
      return setResults([]);
    }

    const controller = new AbortController();
    const { url, method } = route('search', { qs: { term: searchTerm } });
    makeRequest({
      method,
      url,
      controller,
    }).then(({ results: _results }) => {
      setResults(_results);
      setSelectedItem(_results?.[0]);
    });

    return () => controller.abort();
  }, [searchTerm]);

  return (
    <>
      <OpenItem onClick={searchModal.open}>
        <IoIosSearch /> {t('common:search')}
      </OpenItem>
      <Modal
        close={handleCloseModal}
        opened={searchModal.isShowing}
        hideCloseBtn
        css={{ width: '650px' }}
      >
        <form
          onSubmit={handleSubmit}
          css={{
            width: '100%',
            display: 'flex',
            gap: '0.5em',
            flexDirection: 'column',
          }}
        >
          <div
            css={{
              display: 'flex',
              gap: '0.35em',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <label htmlFor="search" css={{ display: 'flex' }}>
              <IoIosSearch size={24} />
            </label>
            <SearchInput
              name="search"
              id="search"
              onChange={({ target }) => handleSearchInputChange(target.value)}
              value={searchTerm}
              placeholder={t('common:search')}
              autoFocus
            />
          </div>
          {results.length > 0 && selectedItem && (
            <SearchResultList
              results={results}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
            />
          )}
          {results.length === 0 && !!searchTerm.trim() && <NoSearchResult />}
          <button
            type="submit"
            disabled={searchTerm.length === 0}
            style={{ display: 'none' }}
          >
            {t('common:confirm')}
          </button>
        </form>
      </Modal>
    </>
  );
}

export default SearchModal;
