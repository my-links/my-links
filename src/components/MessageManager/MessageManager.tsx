import { useRouter } from "next/dist/client/router";

import styles from "./message-manager.module.scss";

interface MessageManagerProps {
  error?: string;
  success?: string;
  info?: string;
}
export default function MessageManager({
  error,
  success,
  info,
}: MessageManagerProps) {
  const infoUrl = useRouter().query?.info as string;
  const errorUrl = useRouter().query?.error as string;
  const successUrl = useRouter().query?.success as string;

  return (
    <>
      {info && <div className={styles["info-msg"]}>{info}</div>}
      {infoUrl && <div className={styles["info-msg"]}>{infoUrl}</div>}

      {error && <div className={styles["error-msg"]}>{error}</div>}
      {errorUrl && <div className={styles["error-msg"]}>{errorUrl}</div>}

      {success && <div className={styles["success-msg"]}>{success}</div>}
      {successUrl && <div className={styles["success-msg"]}>{successUrl}</div>}
    </>
  );
}
