import { FcGoogle } from "react-icons/fc";

import styles from "./search.module.scss";

export default function LabelSearchWithGoogle() {
  return (
    <i className={styles["search-with-google"]}>
      Recherche avec{" "}
      <span>
        <FcGoogle size={24} />
        oogle
      </span>
    </i>
  );
}
