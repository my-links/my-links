import styled from '@emotion/styled';
import { route } from '@izzyjs/route/client';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineFolder } from 'react-icons/ai';
import { CiLink } from 'react-icons/ci';
import { IoIosSearch } from 'react-icons/io';
import Modal from '~/components/common/modal/modal';
import UnstyledList from '~/components/common/unstyled/unstyled_list';
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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const searchModal = useToggle(!!searchTerm);

  const handleCloseModal = useCallback(() => {
    searchModal.close();
    setSearchTerm('');
  }, [searchModal]);

  const handleSearchInputChange = (value: string) => setSearchTerm(value);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) =>
    event.preventDefault();

  useShortcut('OPEN_SEARCH_KEY', searchModal.open, {
    enabled: !searchModal.isShowing,
  });
  useShortcut('ESCAPE_KEY', handleCloseModal, {
    enabled: searchModal.isShowing,
  });

  useEffect(() => {
    if (searchTerm.trim() === '') {
      return setResults([]);
    }
    const { url, method } = route('search', { qs: { term: searchTerm } });
    makeRequest({
      method,
      url,
    }).then(({ results: _results }) => setResults(_results));
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
          {results.length > 0 && (
            <UnstyledList css={{ maxHeight: '500px', overflow: 'auto' }}>
              {results.map((result) => {
                const ItemIcon =
                  result.type === 'link' ? CiLink : AiOutlineFolder;
                const collection =
                  result.type === 'link'
                    ? collections.find((c) => c.id === result.collection_id)
                    : undefined;
                return (
                  <li
                    key={result.type + result.id.toString()}
                    css={{
                      fontSize: '16px',
                      display: 'flex',
                      gap: '0.35em',
                      alignItems: 'center',
                    }}
                  >
                    <ItemIcon size={24} />
                    <span
                      dangerouslySetInnerHTML={{
                        __html: result.matched_part ?? result.name,
                      }}
                    />
                    {collection && <>({collection.name})</>}
                  </li>
                );
              })}
            </UnstyledList>
          )}
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
