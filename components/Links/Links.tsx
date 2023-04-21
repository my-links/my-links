import LinkTag from "next/link";

import { Category } from "../../types";
import LinkItem from "./LinkItem";

import styles from "./links.module.scss";

export default function Links({ category }: { category: Category }) {
  console.log("render", category);
  if (category === null) {
    return (
      <div className={styles["no-category"]}>
        <p>Veuillez séléctionner une categorié</p>
        <LinkTag href="/category/create">ou en créer une</LinkTag>
      </div>
    );
  }

  const { name, links } = category;
  if (links.length === 0) {
    return (
      <div className={styles["no-link"]}>
        <p>
          Aucun lien pour <b>{category.name}</b>
        </p>
        <LinkTag href={`/link/create?categoryId=${category.id}`}>
          Créer un lien
        </LinkTag>
      </div>
    );
  }

  return (
    <div className={styles["links-wrapper"]}>
      <h2>
        {name}
        <span className={styles["links-count"]}> — {links.length}</span>
      </h2>
      <ul className={styles["links"]} key={Math.random()}>
        {links.map((link, key) => (
          <LinkItem key={key} link={link} />
        ))}
      </ul>
    </div>
  );
}
