import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import useModal from "../hooks/useModal";

import Links from "../components/Links/Links";
import SearchModal from "../components/SearchModal/SearchModal";
import SideMenu from "../components/SideMenu/SideMenu";

import { Category, ItemComplete, Link } from "../types";
import { prisma } from "../utils/back";
import { BuildCategory } from "../utils/front";

const OPEN_SEARCH_KEY = "s";
const CLOSE_SEARCH_KEY = "escape";

const OPEN_CREATE_LINK_KEY = "l";
const OPEN_CREATE_CATEGORY_KEY = "c";

interface HomeProps {
  categories: Category[];
  favorites: Link[];
  items: ItemComplete[];
  currentCategory: Category | undefined;
}

function Home({ categories, favorites, currentCategory, items }: HomeProps) {
  const router = useRouter();
  const modal = useModal();

  const [categoryActive, setCategoryActive] = useState<Category | null>(
    currentCategory || categories?.[0]
  );

  const handleSelectCategory = (category: Category) => {
    setCategoryActive(category);
    const newUrl = `/?categoryId=${category.id}`;
    window.history.replaceState(
      { ...window.history.state, as: newUrl, url: newUrl },
      "",
      newUrl
    );
  };

  const openSearchModal = useCallback(
    (event) => {
      event.preventDefault();
      modal.open();
    },
    [modal]
  );
  const closeSearchModal = useCallback(() => modal.close(), [modal]);

  const gotoCreateLink = useCallback(() => {
    router.push(`/link/create?categoryId=${categoryActive.id}`);
  }, [categoryActive.id, router]);

  const gotoCreateCategory = useCallback(() => {
    router.push("/category/create");
  }, [router]);

  useHotkeys(OPEN_SEARCH_KEY, openSearchModal, { enabled: !modal.isShowing });
  useHotkeys(CLOSE_SEARCH_KEY, closeSearchModal, {
    enabled: modal.isShowing,
    enableOnFormTags: ["INPUT"],
  });

  useHotkeys(OPEN_CREATE_LINK_KEY, gotoCreateLink, {
    enabled: !modal.isShowing,
  });
  useHotkeys(OPEN_CREATE_CATEGORY_KEY, gotoCreateCategory, {
    enabled: !modal.isShowing,
  });

  return (
    <div className="App">
      <SideMenu
        categories={categories}
        favorites={favorites}
        handleSelectCategory={handleSelectCategory}
        categoryActive={categoryActive}
      />
      <Links category={categoryActive} />
      {modal.isShowing && (
        <SearchModal
          close={modal.close}
          categories={categories}
          favorites={favorites}
          items={items}
          handleSelectCategory={handleSelectCategory}
        />
      )}
    </div>
  );
}

export async function getServerSideProps({ query }) {
  const queryCategoryId = (query?.categoryId as string) || "";

  const categoriesDB = await prisma.category.findMany({
    include: { links: true },
  });

  const items = [] as ItemComplete[];

  const favorites = [] as Link[];
  const categories = categoriesDB.map((categoryDB) => {
    const category = BuildCategory(categoryDB);

    category.links.map((link) => {
      if (link.favorite) {
        favorites.push(link);
      }
      items.push({
        id: link.id,
        name: link.name,
        url: link.url,
        type: "link",
      });
    });

    items.push({
      id: category.id,
      name: category.name,
      url: `/?categoryId=${category.id}`,
      type: "category",
    });

    return category;
  });

  if (categories.length === 0) {
    return {
      redirect: {
        destination: "/category/create",
      },
    };
  }

  const currentCategory = categories.find(
    (c) => c.id === Number(queryCategoryId)
  );

  return {
    props: {
      categories: JSON.parse(JSON.stringify(categories)),
      favorites: JSON.parse(JSON.stringify(favorites)),
      items: JSON.parse(JSON.stringify(items)),
      currentCategory: currentCategory
        ? JSON.parse(JSON.stringify(currentCategory))
        : null,
    },
  };
}

Home.authRequired = true;
export default Home;
