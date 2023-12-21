import { useState } from 'react';

const useModal = (defaultValue: boolean = false) => {
  const [isShowing, setIsShowing] = useState<boolean>(defaultValue);

  const toggle = () => setIsShowing((value) => !value);
  const open = () => setIsShowing(true);
  const close = () => setIsShowing(false);

  return {
    isShowing,
    toggle,
    open,
    close,
  };
};

export default useModal;
