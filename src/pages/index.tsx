import clsx from 'clsx';
import Links from 'components/Links/Links';
import PageTransition from 'components/PageTransition';
import SideMenu from 'components/SideMenu/SideMenu';
import UserCard from 'components/SideMenu/UserCard/UserCard';
import * as Keys from 'constants/keys';
import PATHS from 'constants/paths';
import ActiveCategoryContext from 'contexts/activeCategoryContext';
import CategoriesContext from 'contexts/categoriesContext';
import FavoritesContext from 'contexts/favoritesContext';
import GlobalHotkeysContext from 'contexts/globalHotkeysContext';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { getServerSideTranslation } from 'i18n';
import getUserCategories from 'lib/category/getUserCategories';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { CategoryWithRelations, LinkWithRelations } from 'types/types';
import { withAuthentication } from 'utils/session';

interface HomePageProps {
  categories: CategoryWithRelations[];
  activeCategory: CategoryWithRelations | undefined;
}

export default function HomePage(props: Readonly<HomePageProps>) {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [globalHotkeysEnable, setGlobalHotkeysEnabled] =
    useState<boolean>(true);
  const [categories, setCategories] = useState<CategoryWithRelations[]>(
    props.categories,
  );
  const [activeCategory, setActiveCategory] =
    useState<CategoryWithRelations | null>(
      props.activeCategory || categories?.[0],
    );

  const handleChangeCategory = (category: CategoryWithRelations) => {
    setActiveCategory(category);
    router.push(`${PATHS.HOME}?categoryId=${category.id}`);
  };

  const favorites = useMemo<LinkWithRelations[]>(
    () =>
      categories.reduce((acc, category) => {
        category.links.forEach((link) =>
          link.favorite ? acc.push(link) : null,
        );
        return acc;
      }, [] as LinkWithRelations[]),
    [categories],
  );

  useHotkeys(
    Keys.OPEN_CREATE_LINK_KEY,
    () => {
      router.push(`${PATHS.LINK.CREATE}?categoryId=${activeCategory.id}`);
    },
    { enabled: globalHotkeysEnable },
  );
  useHotkeys(
    Keys.OPEN_CREATE_CATEGORY_KEY,
    () => {
      router.push(PATHS.CATEGORY.CREATE);
    },
    { enabled: globalHotkeysEnable },
  );

  return (
    <PageTransition
      className={clsx('App', 'flex-row')}
      style={{ flexDirection: 'row' }}
      hideLangageSelector
    >
      <CategoriesContext.Provider value={{ categories, setCategories }}>
        <ActiveCategoryContext.Provider
          value={{ activeCategory, setActiveCategory: handleChangeCategory }}
        >
          <FavoritesContext.Provider value={{ favorites }}>
            <GlobalHotkeysContext.Provider
              value={{
                globalHotkeysEnabled: globalHotkeysEnable,
                setGlobalHotkeysEnabled,
              }}
            >
              {isMobile ? <UserCard /> : <SideMenu />}
              <Links
                category={activeCategory}
                isMobile={isMobile}
              />
            </GlobalHotkeysContext.Provider>
          </FavoritesContext.Provider>
        </ActiveCategoryContext.Provider>
      </CategoriesContext.Provider>
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

    const activeCategory = categories.find(
      ({ id }) => id === Number(queryCategoryId),
    );
    return {
      props: {
        session,
        categories: JSON.parse(
          JSON.stringify(
            categories.toSorted((cata, catb) => cata.order - catb.order),
          ),
        ),
        activeCategory: activeCategory
          ? JSON.parse(JSON.stringify(activeCategory))
          : null,
        ...(await getServerSideTranslation(locale, ['home'])),
      },
    };
  },
);
