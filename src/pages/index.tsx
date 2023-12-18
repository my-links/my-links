import clsx from 'clsx';
import Links from 'components/Links/Links';
import PageTransition from 'components/PageTransition';
import SideMenu from 'components/SideMenu/SideMenu';
import * as Keys from 'constants/keys';
import PATHS from 'constants/paths';
import ActiveCategoryContext from 'contexts/activeCategoryContext';
import CategoriesContext from 'contexts/categoriesContext';
import FavoritesContext from 'contexts/favoritesContext';
import GlobalHotkeysContext from 'contexts/globalHotkeysContext';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'hooks/useMediaQuery';
import useModal from 'hooks/useModal';
import { getServerSideTranslation } from 'i18n';
import getUserCategories from 'lib/category/getUserCategories';
import sortCategoriesByNextId from 'lib/category/sortCategoriesByNextId';
import { useRouter } from 'next/router';
import { CSSProperties, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSwipeable } from 'react-swipeable';
import { CategoryWithLinks, LinkWithCategory } from 'types/types';
import { withAuthentication } from 'utils/session';

interface HomePageProps {
  categories: CategoryWithLinks[];
  activeCategory: CategoryWithLinks | undefined;
}

const swipeOpenMenuStyles: CSSProperties = {
  float: 'left',
  position: 'fixed',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  display: 'flex',
};

export default function HomePage(props: Readonly<HomePageProps>) {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isShowing, open, close } = useModal();
  const handlers = useSwipeable({
    trackMouse: true,
    onSwipedRight: open,
    onSwipedLeft: close,
  });

  const [globalHotkeysEnable, setGlobalHotkeysEnabled] =
    useState<boolean>(true);
  const [categories, setCategories] = useState<CategoryWithLinks[]>(
    props.categories,
  );
  const [activeCategory, setActiveCategory] =
    useState<CategoryWithLinks | null>(props.activeCategory || categories?.[0]);

  const handleChangeCategory = (category: CategoryWithLinks) => {
    setActiveCategory(category);
    router.push(`${PATHS.HOME}?categoryId=${category.id}`);
  };

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

  const variants = {
    open: {
      left: 0,
    },
    close: {
      left: '-100%',
    },
  };
  return (
    <PageTransition
      className={clsx('App', 'flex-row')}
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
              <div
                {...handlers}
                style={swipeOpenMenuStyles}
                onClick={close}
              >
                {!isMobile && <SideMenu />}
                <Links isMobile={isMobile} />
                {isMobile && (
                  <motion.div
                    variants={variants}
                    animate={isShowing ? 'open' : 'close'}
                    initial='close'
                    style={{
                      position: 'absolute',
                      top: '0',
                      height: '100%',
                      backgroundColor: '#f0eef6',
                      boxShadow: '0 0 1em 0 rgba(0,0,0,.3)',
                      padding: '.5em 0',
                    }}
                  >
                    <SideMenu />
                  </motion.div>
                )}
              </div>
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
          JSON.stringify(sortCategoriesByNextId(categories)),
        ),
        activeCategory: activeCategory
          ? JSON.parse(JSON.stringify(activeCategory))
          : null,
        ...(await getServerSideTranslation(locale, ['home'])),
      },
    };
  },
);
