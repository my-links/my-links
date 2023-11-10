import { motion } from "framer-motion";
import { CSSProperties, ReactNode } from "react";
import LangSelector from "./LangSelector/LangSelector";

export default function PageTransition({
  className,
  children,
  style = {},
  hideLangageSelector = false,
}: {
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
  hideLangageSelector?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      style={style}
    >
      {children}
      {!hideLangageSelector && <LangSelector />}
    </motion.div>
  );
}
