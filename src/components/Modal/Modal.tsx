import { ReactNode, useId } from "react";
import { createPortal } from "react-dom";
import { GrClose } from "react-icons/gr";

import { motion } from "framer-motion";
import styles from "./modal.module.scss";

interface ModalProps {
  close?: (...args: any) => void | Promise<void>;

  title?: string;
  children: ReactNode;

  showCloseBtn?: boolean;
  noHeader?: boolean;
  padding?: string;
}
export default function Modal({
  close,
  title,
  children,
  showCloseBtn = true,
  noHeader = false,
  padding = "1em 1.5em",
}: ModalProps) {
  const modalId = useId();
  const handleWrapperClick = (event) =>
    event.target.classList?.[0] === styles["modal-wrapper"] && close();

  return createPortal(
    <motion.div
      className={styles["modal-wrapper"]}
      onClick={handleWrapperClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
    >
      <motion.div
        className={styles["modal-container"]}
        style={{ padding }}
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15, transition: { duration: 0.1 } }}
      >
        {!noHeader && (
          <div className={styles["modal-header"]}>
            <h3>{title}</h3>
            {showCloseBtn && (
              <button
                onClick={close}
                className={`${styles["btn-close"]} reset`}
              >
                <GrClose />
              </button>
            )}
          </div>
        )}
        <div className={styles["modal-body"]}>{children}</div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
