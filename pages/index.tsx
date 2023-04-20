import { useSession } from "next-auth/react";
import { useState } from "react";

import Links from "../components/Links/Links";
import SideMenu from "../components/SideMenu/SideMenu";

import { Category, Link } from "../types";

import { prisma } from "../utils/back";
import { BuildCategory } from "../utils/front";

interface HomeProps {
  categories: Category[];
  favorites: Link[];
}

function Home({ categories, favorites }: HomeProps) {
  const { data } = useSession({ required: true });
  const [categoryActive, setCategoryActive] = useState<Category | null>(
    categories?.[0]
  );

  const handleSelectCategory = (category: Category) =>
    setCategoryActive(category);

  return (
    <div className="App">
      <SideMenu
        categories={categories}
        favorites={favorites}
        handleSelectCategory={handleSelectCategory}
        categoryActive={categoryActive}
        session={data}
      />
      <Links category={categoryActive} />
    </div>
  );
}

export async function getServerSideProps() {
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

  return {
    props: {
      categories: JSON.parse(JSON.stringify(categories)),
      favorites: JSON.parse(JSON.stringify(favorites)),
    },
  };
}

Home.authRequired = true;
export default Home;
