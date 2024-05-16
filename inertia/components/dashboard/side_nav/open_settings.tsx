import styled from '@emotion/styled';
import { BsGear } from 'react-icons/bs';
import Modal from '~/components/common/modal/modal';
import { Item } from '~/components/dashboard/side_nav/nav_item';
import useToggle from '~/hooks/use_modal';

const SettingsButton = styled(Item)(({ theme }) => ({
  color: theme.colors.grey,
}));

export default function OpenSettingsButton() {
  const { isShowing, open, close } = useToggle();

  return (
    <>
      <SettingsButton onClick={open}>
        <BsGear />
        Settings
      </SettingsButton>
      <Modal title="Settings" opened={isShowing} close={close}>
        Modal settings
      </Modal>
    </>
  );
}
