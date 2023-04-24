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
  return (
    <>
      {info && <div className={styles["info-msg"]}>{info}</div>}
      {error && <div className={styles["error-msg"]}>{error}</div>}
      {success && <div className={styles["success-msg"]}>{success}</div>}
    </>
  );
}
