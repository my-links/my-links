import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import useModal from "hooks/useModal";

import Links from "components/Links/Links";
import SearchModal from "components/SearchModal/SearchModal";
import SideMenu from "components/SideMenu/SideMenu";

import * as Keys from "constants/keys";
import { motion } from "framer-motion";
import { Category, Link, SearchItem } from "types";
import { prisma } from "utils/back";
import { BuildCategory } from "utils/front";
import { pushStateVanilla } from "utils/link";

interface HomeProps {
  categories: Category[];
  currentCategory: Category | undefined;
}

function Home(props: HomeProps) {
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
    url: type === "link" ? (item as Link).url : `/?categoryId=${item.id}`,
    type,
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
    pushStateVanilla(`/?categoryId=${category.id}`);
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
      router.push(`/link/create?categoryId=${categoryActive.id}`);
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
    <motion.div
      className="App"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
    >
      <SideMenu
        categories={categories}
        favorites={favorites}
        handleSelectCategory={handleSelectCategory}
        categoryActive={categoryActive}
        openSearchModal={modal.open}
      />
      <Links category={categoryActive} toggleFavorite={toggleFavorite} />
      {modal.isShowing && (
        <SearchModal
          close={modal.close}
          categories={categories}
          favorites={favorites}
          items={itemsSearch}
          handleSelectCategory={handleSelectCategory}
        />
      )}
    </motion.div>
  );
}

export async function getServerSideProps({ query }) {
  const queryCategoryId = (query?.categoryId as string) || "";
  const categoriesDB = await prisma.category.findMany({
    include: { links: true },
  });

  if (categoriesDB.length === 0) {
    return {
      redirect: {
        destination: "/category/create",
      },
    };
  }

  const categories = categoriesDB.map(BuildCategory);
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
