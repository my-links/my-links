import { RefObject, useEffect } from 'react';

// Source : https://stackoverflow.com/a/63359693

/**
 * This Hook can be used for detecting clicks outside the Opened Menu
 */
export default function useClickOutside(
  ref: RefObject<HTMLElement>,
  onClickOutside: () => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref?.current && !ref.current?.contains(event.target as any)) {
        onClickOutside();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, onClickOutside]);
}
