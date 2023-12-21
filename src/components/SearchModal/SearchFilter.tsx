import { useTranslation } from 'next-i18next';

interface SearchFilterProps {
  canSearchLink: boolean;
  setCanSearchLink: (value: boolean) => void;
  canSearchCategory: boolean;
  setCanSearchCategory: (value: boolean) => void;
}

export function SearchFilter({
  canSearchLink,
  setCanSearchLink,
  canSearchCategory,
  setCanSearchCategory,
}: Readonly<SearchFilterProps>) {
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
