import { motion } from "framer-motion";
import LinkTag from "next/link";
import { AiOutlineFolder } from "react-icons/ai";

import LinkFavicon from "components/Links/LinkFavicon";
import { SearchItem } from "types";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./search.module.scss";

export default function SearchListItem({
  item,
  index,
  selected,
  setCursor,
}: {
  item: SearchItem;
  index?: number;
  selected: boolean;
  setCursor: (cursor: number) => void;
}) {
  const id = useId();
  const ref = useRef<HTMLLIElement>(null);

  const [isHover, setHover] = useState<boolean>(false);

  const { name, type, url } = item;

  useEffect(() => {
    if (selected && !isHover) {
      console.log(selected, ref.current);
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isHover, selected]);

  return (
    <motion.li
      className={styles["search-item"]}
      initial={{ y: -15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: index * 0.025,
      }}
      ref={ref}
      onMouseEnter={() => {
        setCursor(index);
        setHover(true);
      }}
      onMouseLeave={() => setHover(false)}
      key={id}
    >
      <LinkTag href={url} target="_blank" rel="no-referrer">
        {type === "link" ? (
          <LinkFavicon url={item.url} noMargin size={24} />
        ) : (
          <AiOutlineFolder size={24} />
        )}
        <span>{name}</span>
        {selected && "selected"}
      </LinkTag>
    </motion.li>
  );
}
