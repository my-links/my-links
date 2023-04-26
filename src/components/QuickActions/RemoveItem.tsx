import LinkTag from "next/link";
import { CgTrashEmpty } from "react-icons/cg";

import { Category, Link } from "types";

import styles from "./quickactions.module.scss";

export default function RemoveItem({
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
      href={`/${type}/remove/${id}`}
      title={`Remove ${type}`}
      className={styles["action"]}
      onClick={onClick && onClick}
    >
      <CgTrashEmpty color="red" />
    </LinkTag>
  );
}
