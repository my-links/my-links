import Checkbox from 'components/Checkbox';
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
      <Checkbox
        name='favorite'
        isChecked={canSearchLink}
        onChangeCallback={(value) => setCanSearchLink(value)}
        label={t('common:link.links')}
        dir='rtl'
      />
      <Checkbox
        name='filter-category'
        isChecked={canSearchCategory}
        onChangeCallback={(value) => setCanSearchCategory(value)}
        label={t('common:category.categories')}
        dir='rtl'
      />
    </div>
  );
}
