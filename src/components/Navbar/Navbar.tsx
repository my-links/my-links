import LinkTag from "next/link";
import { useSession } from "next-auth/react";
import PATHS from "constants/paths";
import styles from "./navbar.module.scss";
import { useTranslation } from "next-i18next";

export default function Navbar() {
  const { status } = useSession();
  const { t } = useTranslation();

  return (
    <nav className={styles["navbar"]}>
      <ul className="reset">
        <li>
          <LinkTag href={PATHS.HOME}>MyLinks</LinkTag>
        </li>
        <li>
          <LinkTag href={PATHS.PRIVACY}>{t("common:privacy")}</LinkTag>
        </li>
        <li>
          <LinkTag href={PATHS.TERMS}>{t("common:terms")}</LinkTag>
        </li>
        {status === "authenticated" ? (
          <li>
            <LinkTag href={PATHS.LOGOUT}>{t("common:logout")}</LinkTag>
          </li>
        ) : (
          <li>
            <LinkTag href={PATHS.LOGIN}>{t("common:login")}</LinkTag>
          </li>
        )}
      </ul>
    </nav>
  );
}
