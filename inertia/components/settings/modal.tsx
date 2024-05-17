import { useTranslation } from 'react-i18next';
import { BsGear } from 'react-icons/bs';
import Modal from '~/components/common/modal/modal';
import LangSelector from '~/components/lang_selector';
import ThemeSwitcher from '~/components/theme_switcher';
import useToggle from '~/hooks/use_modal';

export default function ModalSettings({
  openItem: OpenItem,
}: {
  // TODO: fix this :()
  openItem: any;
}) {
  const { t } = useTranslation('common');
  const { isShowing, open, close } = useToggle();
  return (
    <>
      <OpenItem onClick={open}>
        <BsGear />
        {t('settings')}
      </OpenItem>
      <Modal title={t('settings')} opened={isShowing} close={close}>
        <LangSelector />
        <hr />
        <ThemeSwitcher />
      </Modal>
    </>
  );
}
