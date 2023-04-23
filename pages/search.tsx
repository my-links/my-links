import LinkTag from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { FcGoogle } from "react-icons/fc";

import FormLayout from "../components/FormLayout";
import TextBox from "../components/TextBox";

import useAutoFocus from "../hooks/useAutoFocus";

import LinkFavicon from "../components/Links/LinkFavicon";

import { Link } from "../types";
import { prisma } from "../utils/back";
import { BuildCategory } from "../utils/front";

import styles from "../styles/search.module.scss";

interface ItemComplete {
  id: number;
  name: string;
  url: string;
  type: "category" | "link";
}

interface SearchPageProps {
  favorites: Link[];
  items: ItemComplete[];
}

export default function SearchPage({ favorites, items }: SearchPageProps) {
  const router = useRouter();
  const autoFocusRef = useAutoFocus();

  const [search, setSearch] = useState<string>("");
  const canSubmit = useMemo<boolean>(() => search.length > 0, [search]);

  const itemsCompletion = useMemo(
    () =>
      search.length > 0
        ? items.filter((item) =>
            item.name
              .toLocaleLowerCase()
              .includes(search.toLocaleLowerCase().trim())
          )
        : [],
    [items, search]
  );
  console.log("itemsCompletion", itemsCompletion);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      setSearch("");
      if (itemsCompletion.length > 0) {
        const firstItem = itemsCompletion[0];
        if (firstItem.type === "link") {
          window.open(firstItem.url);
        } else {
          router.push(firstItem.url);
        }
      } else {
        window.open(`https://google.com/search?q=${encodeURI(search.trim())}`);
      }
    },
    [itemsCompletion, router, search]
  );

  return (
    <>
      <FormLayout
        title="Search"
        canSubmit={canSubmit}
        handleSubmit={handleSubmit}
      >
        <TextBox
          name="search"
          onChangeCallback={(value) => setSearch(value)}
          value={search}
          placeholder="Rechercher"
          innerRef={autoFocusRef}
          fieldClass={styles["search-input-field"]}
        />
        {search.length === 0 && favorites.length > 0 && (
          <ListItemComponent
            items={favorites.map((favorite) => ({
              id: favorite.id,
              name: favorite.name,
              url: favorite.url,
              type: "link",
            }))}
            noItem={<p>ajouter un favoris</p>}
          />
        )}
        {search.length > 0 && (
          <ListItemComponent
            items={itemsCompletion.map((item) => ({
              id: item.id,
              name: item.name,
              url: item.url,
              type: item.type,
            }))}
            noItem={
              <i
                style={{ display: "flex", alignItems: "center", gap: ".25em" }}
              >
                Recherche avec{" "}
                <span style={{ display: "flex", alignItems: "center" }}>
                  <FcGoogle size={24} />
                  oogle
                </span>
              </i>
            }
          />
        )}
      </FormLayout>
    </>
  );
}

function ListItemComponent({
  items,
  noItem,
}: {
  items: ItemComplete[];
  noItem?: ReactNode;
}) {
  return (
    <ul
      style={{
        margin: "1em 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1em",
      }}
    >
      {items.length > 0 ? (
        items.map((item) => (
          <ItemComponent
            item={{
              id: item.id,
              name: item.name,
              url: item.url,
              type: item.type,
            }}
            key={item.type + "-" + item.id}
          />
        ))
      ) : noItem ? (
        noItem
      ) : (
        <i>no item found</i>
      )}
    </ul>
  );
}

function ItemComponent({ item }: { item: ItemComplete }) {
  const { name, type, url } = item;
  return (
    <li>
      <LinkTag
        href={url}
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {type === "link" ? (
          <LinkFavicon url={item.url} noMargin />
        ) : (
          <span>category</span>
        )}
        <span>{name}</span>
      </LinkTag>
    </li>
  );
}

export async function getServerSideProps() {
  const categoriesDB = await prisma.category.findMany({
    include: { links: true },
  });

  const items = [] as ItemComplete[];

  const favorites = [] as Link[];
  categoriesDB.forEach((categoryDB) => {
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
  });

  return {
    props: {
      favorites: JSON.parse(JSON.stringify(favorites)),
      items: JSON.parse(JSON.stringify(items)),
    },
  };
}
