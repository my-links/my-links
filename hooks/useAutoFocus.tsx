import { useCallback } from "react";

export default function useAutoFocus() {
  const inputRef = useCallback((inputElement: any) => {
    if (inputElement) {
      inputElement.focus();
    }
  }, []);

  return inputRef;
}
