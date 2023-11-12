import Image from "next/image";
import { useState } from "react";
import { TbLoader3 } from "react-icons/tb";
import { TfiWorld } from "react-icons/tfi";

import { faviconLinkBuilder } from "utils/link";

import styles from "./links.module.scss";

interface LinkFaviconProps {
  url: string;
  size?: number;
  noMargin?: boolean;
}

// The Favicon API should always return an image, so it's not really useful to keep the loader nor placeholder icon,
// but for slow connections and other random stuff, I'll keep this
export default function LinkFavicon({
  url,
  size = 32,
  noMargin = false
}: LinkFaviconProps) {
  const [isFailed, setFailed] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);

  const setFallbackFavicon = () => setFailed(true);
  const handleStopLoading = () => setLoading(false);

  const { origin } = new URL(url);

  return (
    <div
      className={styles["favicon"]}
      style={{ marginRight: !noMargin ? "1em" : "0" }}
    >
      {!isFailed ? (
        <Image
          src={faviconLinkBuilder(origin)}
          onError={() => {
            setFallbackFavicon();
            handleStopLoading();
          }}
          onLoad={handleStopLoading}
          height={size}
          width={size}
          alt="icon"
        />
      ) : (
        <TfiWorld size={size} />
      )}
      {isLoading && (
        <span
          className={styles["favicon-loader"]}
          style={{ height: `${size}px`, width: `${size}px` }}
        >
          <TbLoader3 size={size} />
        </span>
      )}
    </div>
  );
}
