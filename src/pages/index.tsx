import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import Links from "components/Links/Links";
import PageTransition from "components/PageTransition";
import SearchModal from "components/SearchModal/SearchModal";
import SideMenu from "components/SideMenu/SideMenu";

import * as Keys from "constants/keys";
import PATHS from "constants/paths";
import useModal from "hooks/useModal";
import { Category, Link, SearchItem } from "types";

import getUserCategories from "lib/category/getUserCategories";
import getUser from "lib/user/getUser";
import { pushStateVanilla } from "utils/link";
import { getSession } from "utils/session";

interface HomePageProps {
  categories: Category[];
  currentCategory: Category | undefined;
}

function Home(props: HomePageProps) {
  const router = useRouter();
  const modal = useModal();

  const [categories, setCategories] = useState<Category[]>(props.categories);
  const [categoryActive, setCategoryActive] = useState<Category | null>(
    props.currentCategory || categories?.[0]
  );

  const favorites = useMemo<Link[]>(
    () =>
      categories.reduce((acc, category) => {
        category.links.forEach((link) =>
          link.favorite ? acc.push(link) : null
        );
        return acc;
      }, [] as Link[]),
    [categories]
  );

  const searchItemBuilder = (
    item: Category | Link,
    type: SearchItem["type"]
  ): SearchItem => ({
    id: item.id,
    name: item.name,
    url:
      type === "link"
        ? (item as Link).url
        : `${PATHS.HOME}?categoryId=${item.id}`,
    type,
    category: type === "link" ? (item as Link).category : undefined,
  });

  const itemsSearch = useMemo<SearchItem[]>(() => {
    const items = categories.reduce((acc, category) => {
      const categoryItem = searchItemBuilder(category, "category");
      const items: SearchItem[] = category.links.map((link) =>
        searchItemBuilder(link, "link")
      );
      return [...acc, ...items, categoryItem];
    }, [] as SearchItem[]);

    return items;
  }, [categories]);

  // TODO: refacto
  const toggleFavorite = useCallback(
    (linkId: Link["id"]) => {
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
    [categories, categoryActive.id]
  );

  const handleSelectCategory = (category: Category) => {
    setCategoryActive(category);
    pushStateVanilla(`${PATHS.HOME}?categoryId=${category.id}`);
  };

  useHotkeys(
    Keys.OPEN_SEARCH_KEY,
    (event) => {
      event.preventDefault();
      modal.open();
    },
    { enabled: !modal.isShowing }
  );
  useHotkeys(Keys.CLOSE_SEARCH_KEY, modal.close, {
    enabled: modal.isShowing,
    enableOnFormTags: ["INPUT"],
  });

  useHotkeys(
    Keys.OPEN_CREATE_LINK_KEY,
    () => {
      router.push(`${PATHS.LINK.CREATE}?categoryId=${categoryActive.id}`);
    },
    {
      enabled: !modal.isShowing,
    }
  );
  useHotkeys(
    Keys.OPEN_CREATE_CATEGORY_KEY,
    () => {
      router.push("/category/create");
    },
    {
      enabled: !modal.isShowing,
    }
  );

  useHotkeys(
    Keys.ARROW_UP,
    () => {
      const currentCategoryIndex = categories.findIndex(
        ({ id }) => id === categoryActive.id
      );
      if (currentCategoryIndex === -1 || currentCategoryIndex === 0) return;

      handleSelectCategory(categories[currentCategoryIndex - 1]);
    },
    { enabled: !modal.isShowing }
  );
  useHotkeys(
    Keys.ARROW_DOWN,
    () => {
      const currentCategoryIndex = categories.findIndex(
        ({ id }) => id === categoryActive.id
      );
      if (
        currentCategoryIndex === -1 ||
        currentCategoryIndex === categories.length - 1
      )
        return;

      handleSelectCategory(categories[currentCategoryIndex + 1]);
    },
    { enabled: !modal.isShowing }
  );

  return (
    <PageTransition className="App">
      <SideMenu
        categories={categories}
        favorites={favorites}
        handleSelectCategory={handleSelectCategory}
        categoryActive={categoryActive}
        openSearchModal={modal.open}
      />
      <Links category={categoryActive} toggleFavorite={toggleFavorite} />
      <AnimatePresence>
        {modal.isShowing && (
          <SearchModal
            close={modal.close}
            categories={categories}
            items={itemsSearch}
            handleSelectCategory={handleSelectCategory}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

export async function getServerSideProps({ req, res, query }) {
  const queryCategoryId = (query?.categoryId as string) || "";

  const session = await getSession(req, res);
  const user = await getUser(session);
  if (!user) {
    return {
      redirect: {
        destination: PATHS.LOGIN,
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

  const currentCategory = categories.find(
    ({ id }) => id === Number(queryCategoryId)
  );
  return {
    props: {
      categories: JSON.parse(JSON.stringify(categories)),
      currentCategory: currentCategory
        ? JSON.parse(JSON.stringify(currentCategory))
        : null,
    },
  };
}

Home.authRequired = true;
export default Home;
