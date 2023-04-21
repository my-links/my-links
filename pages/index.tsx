import { useRouter } from "next/router";
import { useState } from "react";

import Links from "../components/Links/Links";
import SideMenu from "../components/SideMenu/SideMenu";

import { Category, Link } from "../types";
import { prisma } from "../utils/back";
import { BuildCategory } from "../utils/front";

interface HomeProps {
  categories: Category[];
  favorites: Link[];
  currentCategory: Category | undefined;
}

function Home({ categories, favorites, currentCategory }: HomeProps) {
  const router = useRouter();

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

  return (
    <div className="App">
      <SideMenu
        categories={categories}
        favorites={favorites}
        handleSelectCategory={handleSelectCategory}
        categoryActive={categoryActive}
      />
      <Links category={categoryActive} />
    </div>
  );
}

export async function getServerSideProps({ query }) {
  const queryCategoryId = (query?.categoryId as string) || "";

  const categoriesDB = await prisma.category.findMany({
    include: { links: true },
  });

  const favorites = [] as Link[];
  const categories = categoriesDB.map((categoryDB) => {
    const category = BuildCategory(categoryDB);
    category.links.map((link) => (link.favorite ? favorites.push(link) : null));
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
      currentCategory: currentCategory
        ? JSON.parse(JSON.stringify(currentCategory))
        : null,
    },
  };
}

Home.authRequired = true;
export default Home;
