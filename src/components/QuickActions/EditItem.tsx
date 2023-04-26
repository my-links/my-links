import LinkTag from "next/link";
import { AiOutlineEdit } from "react-icons/ai";

import { Category, Link } from "types";

import styles from "./quickactions.module.scss";

export default function EditItem({
  type,
  id,
  onClick,
}: {
  type: "category" | "link";
  id: Link["id"] | Category["id"];
  onClick?: (event: any) => void; // FIXME: find good event type
}) {
  return (
    <LinkTag
      href={`/${type}/edit/${id}`}
      title={`Edit ${type}`}
      className={styles["action"]}
      onClick={onClick && onClick}
    >
      <AiOutlineEdit />
    </LinkTag>
  );
}
