import PATHS from "constants/paths";
import { signOut, useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import { FiLogOut } from "react-icons/fi";
import { TFunctionParam } from "types/i18next";
import styles from "./user-card.module.scss";

export default function UserCard() {
  const { data } = useSession({ required: true });
  const { t } = useTranslation();

  const avatarLabel = t("common:avatar", {
    name: data.user.name,
  } as TFunctionParam);
  return (
    <div className={styles["user-card-wrapper"]}>
      <div className={styles["user-card"]}>
        <Image
          src={data.user.image}
          width={28}
          height={28}
          alt={avatarLabel}
          title={avatarLabel}
        />
        {data.user.name}
      </div>
      <button
        onClick={() => signOut({ callbackUrl: PATHS.LOGIN })}
        className="reset"
        title={t("common:logout")}
      >
        <FiLogOut size={24} />
      </button>
    </div>
  );
}
