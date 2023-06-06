import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(getMediaMatches(query));

  const handleMediaChange = () => setMatches(getMediaMatches(query));

  useEffect(() => {
    const matchMedia = window.matchMedia(query);
    handleMediaChange();

    matchMedia.addEventListener("change", handleMediaChange);
    return () => matchMedia.removeEventListener("change", handleMediaChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return matches;
}

function getMediaMatches(query: string): boolean {
  if (typeof window !== "undefined") {
    return window.matchMedia(query).matches;
  }
  return false;
}
