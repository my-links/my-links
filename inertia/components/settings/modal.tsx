import { BsGear } from 'react-icons/bs';
import Modal from '~/components/common/modal/modal';
import ThemeSwitcher from '~/components/theme_switcher';
import useToggle from '~/hooks/use_modal';

export default function ModalSettings({
  openItem: OpenItem,
}: {
  // TODO: fix this :()
  openItem: any;
}) {
  const { isShowing, open, close } = useToggle();
  return (
    <>
      <OpenItem onClick={open}>
        <BsGear />
        Settings
      </OpenItem>
      <Modal title="Settings" opened={isShowing} close={close}>
        Modal settings
        <hr />
        <select>
          <option>EN</option>
        </select>
        <hr />
        <ThemeSwitcher />
      </Modal>
    </>
  );
}
