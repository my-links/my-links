import { useState } from "react";

const useModal = () => {
  const [isShowing, setIsShowing] = useState<boolean>(false);

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
