import ButtonLink from "components/ButtonLink";
import { BsSearch } from "react-icons/bs";

import styles from "./quickactions.module.scss";

export default function QuickActionSearch({
  openSearchModal,
}: {
  openSearchModal: () => void;
}) {
  return (
    <ButtonLink className={styles["action"]} onClick={openSearchModal}>
      <BsSearch />
    </ButtonLink>
  );
}
