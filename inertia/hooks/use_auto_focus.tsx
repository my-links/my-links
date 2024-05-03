import { useCallback } from 'react';

export default function useAutoFocus() {
  return useCallback((inputElement: any) => {
    if (inputElement) {
      inputElement.focus();
    }
  }, []);
}
