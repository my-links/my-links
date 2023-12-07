import clsx from 'clsx';
import BlockWrapper from 'components/BlockWrapper/BlockWrapper';
import ButtonLink from 'components/ButtonLink';
import Links from 'components/Links/Links';
import Modal from 'components/Modal/Modal';
import PageTransition from 'components/PageTransition';
import SearchModal from 'components/SearchModal/SearchModal';
import Categories from 'components/SideMenu/Categories/Categories';
import SideMenu from 'components/SideMenu/SideMenu';
import UserCard from 'components/SideMenu/UserCard/UserCard';
import * as Keys from 'constants/keys';
import PATHS from 'constants/paths';
import { AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'hooks/useMediaQuery';
import useModal from 'hooks/useModal';
import { getServerSideTranslation } from 'i18n';
import getUserCategories from 'lib/category/getUserCategories';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Category, Link, SearchItem } from 'types';
import { withAuthentication } from 'utils/session';

interface HomePageProps {
  categories: Category[];
  currentCategory: Category | undefined;
}

export default function HomePage(props: Readonly<HomePageProps>) {
  const router = useRouter();
  const searchModal = useModal();
  const { t } = useTranslation();

  const isMobile = useMediaQuery('(max-width: 768px)');
  const mobileModal = useModal();

  const [categories, setCategories] = useState<Category[]>(props.categories);
  const [categoryActive, setCategoryActive] = useState<Category | null>(
    props.currentCategory || categories?.[0],
  );

  const favorites = useMemo<Link[]>(
    () =>
      categories.reduce((acc, category) => {
        category.links.forEach((link) =>
          link.favorite ? acc.push(link) : null,
        );
        return acc;
      }, [] as Link[]),
    [categories],
  );

  const searchItemBuilder = (
    item: Category | Link,
    type: SearchItem['type'],
  ): SearchItem => ({
    id: item.id,
    name: item.name,
    url:
      type === 'link'
        ? (item as Link).url
        : `${PATHS.HOME}?categoryId=${item.id}`,
    type,
    category: type === 'link' ? (item as Link).category : undefined,
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

  // TODO: refactor
  const toggleFavorite = useCallback(
    (linkId: Link['id']) => {
      let linkIndex = 0;
      const categoryIndex = categories.findIndex(({ links }) => {
        const lIndex = links.findIndex((l) => l.id === linkId);
        if (lIndex !== -1) {
          linkIndex = lIndex;
        }
        return lIndex !== -1;
      });

      const link = categories[categoryIndex].links[linkIndex];
      const categoriesCopy = [...categories];
      categoriesCopy[categoryIndex].links[linkIndex] = {
        ...link,
        favorite: !link.favorite,
      };

      setCategories(categoriesCopy);
      if (categories[categoryIndex].id === categoryActive.id) {
        setCategoryActive(categories[categoryIndex]);
      }
    },
    [categories, categoryActive.id],
  );

  const handleSelectCategory = (category: Category) => {
    setCategoryActive(category);
    router.push(`${PATHS.HOME}?categoryId=${category.id}`);
    mobileModal.close();
  };

  const moveCategory = useCallback((dragIndex: number, hoverIndex: number) => {
    setCategories((prevCategories: Category[]) => {
      const categories = [...prevCategories];
      return arrayMove(categories, dragIndex, hoverIndex);
    });
  }, []);

  const areHotkeysEnabled = { enabled: !searchModal.isShowing };
  useHotkeys(
    Keys.OPEN_SEARCH_KEY,
    (event) => {
      event.preventDefault();
      searchModal.open();
    },
    areHotkeysEnabled,
  );
  useHotkeys(Keys.CLOSE_SEARCH_KEY, searchModal.close, {
    enabled: searchModal.isShowing,
    enableOnFormTags: ['INPUT'],
  });

  useHotkeys(
    Keys.OPEN_CREATE_LINK_KEY,
    () => {
      router.push(`${PATHS.LINK.CREATE}?categoryId=${categoryActive.id}`);
    },
    areHotkeysEnabled,
  );
  useHotkeys(
    Keys.OPEN_CREATE_CATEGORY_KEY,
    () => {
      router.push('/category/create');
    },
    areHotkeysEnabled,
  );

  return (
    <PageTransition
      className={clsx('App', 'flex-row')}
      style={{ flexDirection: 'row' }}
      hideLangageSelector
    >
      {isMobile ? (
        <UserCard />
      ) : (
        <SideMenu
          categories={categories}
          moveCategory={moveCategory}
          favorites={favorites}
          handleSelectCategory={handleSelectCategory}
          categoryActive={categoryActive}
          openSearchModal={searchModal.open}
          isModalShowing={searchModal.isShowing}
        />
      )}
      <Links
        category={categoryActive}
        toggleFavorite={toggleFavorite}
        isMobile={isMobile}
        openMobileModal={mobileModal.open}
        openSearchModal={searchModal.open}
      />
      <AnimatePresence>
        {searchModal.isShowing && (
          <SearchModal
            close={searchModal.close}
            categories={categories}
            items={itemsSearch}
            handleSelectCategory={handleSelectCategory}
            noHeader={!isMobile}
          />
        )}
        {mobileModal.isShowing && (
          <Modal close={mobileModal.close}>
            <BlockWrapper style={{ minHeight: '0', flex: '1' }}>
              <ButtonLink href={PATHS.CATEGORY.CREATE}>
                {t('common:category.create')}
              </ButtonLink>
              <Categories
                categories={categories}
                categoryActive={categoryActive}
                handleSelectCategory={handleSelectCategory}
                moveCategory={moveCategory}
              />
            </BlockWrapper>
          </Modal>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

export const getServerSideProps = withAuthentication(
  async ({ query, session, user, locale }) => {
    const queryCategoryId = (query?.categoryId as string) || '';

    const categories = await getUserCategories(user);
    if (categories.length === 0) {
      return {
        redirect: {
          destination: PATHS.CATEGORY.CREATE,
        },
      };
    }

    const currentCategory = categories.find(
      ({ id }) => id === Number(queryCategoryId),
    );
    return {
      props: {
        session,
        categories: JSON.parse(JSON.stringify(categories)),
        currentCategory: currentCategory
          ? JSON.parse(JSON.stringify(currentCategory))
          : null,
        ...(await getServerSideTranslation(locale, ['home'])),
      },
    };
  },
);

function arrayMove(arr: any[], previousIndex: number, nextIndex: number) {
  if (nextIndex >= arr.length) {
    let k = nextIndex - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(nextIndex, 0, arr.splice(previousIndex, 1)[0]);
  return arr; // for testing
}
