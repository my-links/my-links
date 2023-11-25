import { AnimatePresence } from "framer-motion";
import useModal from "hooks/useModal";
import Modal from "../Modal/Modal";
import * as Keys from "constants/keys";
import { useHotkeys } from "react-hotkeys-hook";
import { IoSettingsOutline } from "react-icons/io5";
import LangSelector from "../LangSelector";

export default function SettingsModal() {
  const modal = useModal();
  useHotkeys(Keys.CLOSE_SEARCH_KEY, modal.close, {
    enabled: modal.isShowing,
    enableOnFormTags: ["INPUT"],
  });

  return (
    <>
      <button onClick={modal.open} className="reset" title="Settings">
        <IoSettingsOutline size={24} />
      </button>
      <AnimatePresence>
        {modal.isShowing && (
          <Modal title="Settings" close={modal.close}>
            <LangSelector />
            <p>about tab with all links related to MyLinks</p>
            <button>disconnect</button>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
