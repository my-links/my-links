import ButtonLink from "components/ButtonLink";
import PATHS from "constants/paths";
import { useTranslation } from "next-i18next";
import { SideMenuProps } from "./SideMenu";
import styles from "./sidemenu.module.scss";

export default function NavigationLinks({
  categoryActive,
  openSearchModal,
}: {
  categoryActive: SideMenuProps["categoryActive"];
  openSearchModal: SideMenuProps["openSearchModal"];
}) {
  const { t } = useTranslation();

  return (
    <div className={styles["menu-controls"]}>
      <div className={styles["action"]}>
        <ButtonLink onClick={openSearchModal}>{t("common:search")}</ButtonLink>
        <kbd>S</kbd>
      </div>
      <div className={styles["action"]}>
        <ButtonLink href={PATHS.CATEGORY.CREATE}>
          {t("common:category.create")}
        </ButtonLink>
        <kbd>C</kbd>
      </div>
      <div className={styles["action"]}>
        <ButtonLink
          href={`${PATHS.LINK.CREATE}?categoryId=${categoryActive.id}`}
        >
          {t("common:link.create")}
        </ButtonLink>
        <kbd>L</kbd>
      </div>
    </div>
  );
}
