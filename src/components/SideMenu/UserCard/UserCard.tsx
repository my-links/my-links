import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { FiLogOut } from "react-icons/fi";

import styles from "./user-card.module.scss";

export default function UserCard() {
  const { data } = useSession({ required: true });
  return (
    <div className={styles["user-card-wrapper"]}>
      <div className={styles["user-card"]}>
        <Image
          src={data.user.image}
          width={28}
          height={28}
          alt={`${data.user.name}'s avatar`}
        />
        {data.user.name}
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/signin" })}
        className="reset"
      >
        <FiLogOut size={24} />
      </button>
    </div>
  );
}
