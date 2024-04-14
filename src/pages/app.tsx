import clsx from 'clsx';
import Links from 'components/Links/Links';
import PageTransition from 'components/PageTransition';
import SideMenu from 'components/SideMenu/SideMenu';
import SideNavigation from 'components/SideNavigation/SideNavigation';
import * as Keys from 'constants/keys';
import PATHS from 'constants/paths';
import ActiveCategoryContext from 'contexts/activeCategoryContext';
import CategoriesContext from 'contexts/categoriesContext';
import FavoritesContext from 'contexts/favoritesContext';
import GlobalHotkeysContext from 'contexts/globalHotkeysContext';
import { AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'hooks/useMediaQuery';
import useModal from 'hooks/useModal';
import { getServerSideTranslation } from 'i18n';
import getPublicCategoryById from 'lib/category/getPublicCategoryById';
import getUserCategories from 'lib/category/getUserCategories';
import sortCategoriesByNextId from 'lib/category/sortCategoriesByNextId';
import getUser from 'lib/user/getUser';
import { useRouter } from 'next/router';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSwipeable } from 'react-swipeable';
import styles from 'styles/home.module.scss';
import { CategoryWithLinks, LinkWithCategory } from 'types/types';
import { getSession } from 'utils/session';

interface HomePageProps {
  categories: CategoryWithLinks[];
  activeCategory: CategoryWithLinks | undefined;
}

export default function HomePage(props: Readonly<HomePageProps>) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isShowing, open, close } = useModal();
  const handlers = useSwipeable({
    trackMouse: true,
    onSwipedRight: open,
  });

  useEffect(() => {
    if (!isMobile && isShowing) {
      close();
    }
  }, [close, isMobile, isShowing]);

  return (
    <PageTransition
      className={clsx('App', 'flex-row')}
      hideLangageSelector
    >
      <HomeProviders
        categories={props.categories}
        activeCategory={props.activeCategory}
      >
        <div
          className={styles['swipe-handler']}
          {...handlers}
        >
          {!isMobile && (
            <div className={styles['side-bar']}>
              <SideNavigation />
            </div>
          )}
          <AnimatePresence>
            {isShowing && (
              <SideMenu close={close}>
                <SideNavigation />
              </SideMenu>
            )}
          </AnimatePresence>
          <Links
            isMobile={isMobile}
            openSideMenu={open}
          />
        </div>
      </HomeProviders>
    </PageTransition>
  );
}

function HomeProviders(
  props: Readonly<{
    children: ReactNode;
    categories: CategoryWithLinks[];
    activeCategory: CategoryWithLinks;
  }>,
) {
  const router = useRouter();
  const [globalHotkeysEnabled, setGlobalHotkeysEnabled] =
    useState<boolean>(true);
  const [categories, setCategories] = useState<CategoryWithLinks[]>(
    props.categories,
  );
  const [activeCategory, setActiveCategory] =
    useState<CategoryWithLinks | null>(props.activeCategory || categories?.[0]);

  const handleChangeCategory = useCallback(
    (category: CategoryWithLinks) => {
      setActiveCategory(category);
      router.push(`${PATHS.APP}?categoryId=${category.id}`);
    },
    [router],
  );

  const favorites = useMemo<LinkWithCategory[]>(
    () =>
      categories.reduce((acc, category) => {
        category.links.forEach((link) =>
          link.favorite ? acc.push(link) : null,
        );
        return acc;
      }, [] as LinkWithCategory[]),
    [categories],
  );

  const categoriesContextValue = useMemo(
    () => ({ categories, setCategories }),
    [categories],
  );
  const activeCategoryContextValue = useMemo(
    () => ({ activeCategory, setActiveCategory: handleChangeCategory }),
    [activeCategory, handleChangeCategory],
  );
  const favoritesContextValue = useMemo(() => ({ favorites }), [favorites]);
  const globalHotkeysContextValue = useMemo(
    () => ({
      globalHotkeysEnabled: globalHotkeysEnabled,
      setGlobalHotkeysEnabled,
    }),
    [globalHotkeysEnabled],
  );

  useHotkeys(
    Keys.OPEN_CREATE_LINK_KEY,
    () => {
      router.push(`${PATHS.LINK.CREATE}?categoryId=${activeCategory.id}`);
    },
    { enabled: globalHotkeysEnabled },
  );
  useHotkeys(
    Keys.OPEN_CREATE_CATEGORY_KEY,
    () => {
      router.push(PATHS.CATEGORY.CREATE);
    },
    { enabled: globalHotkeysEnabled },
  );
  return (
    <CategoriesContext.Provider value={categoriesContextValue}>
      <ActiveCategoryContext.Provider value={activeCategoryContextValue}>
        <FavoritesContext.Provider value={favoritesContextValue}>
          <GlobalHotkeysContext.Provider value={globalHotkeysContextValue}>
            {props.children}
          </GlobalHotkeysContext.Provider>
        </FavoritesContext.Provider>
      </ActiveCategoryContext.Provider>
    </CategoriesContext.Provider>
  );
}

export async function getServerSideProps({ req, res, locale, query }) {
  const session = await getSession(req, res);
  const user = await getUser(session);

  const queryCategoryId = (query?.categoryId as string) || '';
  const searchQueryParam = (query?.q as string)?.toLowerCase() || '';

  const publicCategory = await getPublicCategoryById(Number(queryCategoryId));
  if (!publicCategory && !user) {
    return {
      redirect: {
        destination: PATHS.LOGIN,
      },
    };
  }

  if (!!publicCategory && publicCategory.authorId !== user?.id) {
    return {
      redirect: {
        destination: `${PATHS.SHARED}?id=${publicCategory.id}`,
      },
    };
  }

  const categories = await getUserCategories(user);
  if (categories.length === 0) {
    return {
      redirect: {
        destination: PATHS.CATEGORY.CREATE,
      },
    };
  }

  const link = categories
    .map((category) => category.links)
    .flat()
    .find(
      (link: LinkWithCategory) =>
        link.name.toLowerCase() === searchQueryParam ||
        link.url.toLowerCase() === searchQueryParam,
    );
  if (link) {
    return {
      redirect: {
        destination: link.url,
      },
    };
  }

  const activeCategory = categories.find(
    ({ id }) => id === Number(queryCategoryId),
  );
  return {
    redirect: !activeCategory &&
      queryCategoryId && {
        destination: PATHS.APP,
      },
    props: {
      session,
      categories: JSON.parse(
        JSON.stringify(sortCategoriesByNextId(categories)),
      ),
      activeCategory: activeCategory
        ? JSON.parse(JSON.stringify(activeCategory))
        : null,
      ...(await getServerSideTranslation(locale, ['home'])),
    },
  };
}
