import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { FiLogOut } from "react-icons/fi";

import styles from "./user-card.module.scss";

export default function UserCard({ session }: { session: Session }) {
  return (
    <div className={styles["user-card-wrapper"]}>
      <div className={styles["user-card"]}>
        <Image
          src={session.user.image}
          width={28}
          height={28}
          alt={`${session.user.name}'s avatar`}
        />
        {session.user.name}
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
