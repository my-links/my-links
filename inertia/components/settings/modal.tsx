import { Link } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { useTranslation } from 'react-i18next';
import { PiGearLight } from 'react-icons/pi';
import Modal from '~/components/common/modal/modal';
import LangSelector from '~/components/lang_selector';
import ThemeSwitcher from '~/components/theme_switcher';
import useToggle from '~/hooks/use_modal';
import useUser from '~/hooks/use_user';

export default function ModalSettings({
  openItem: OpenItem,
}: {
  // TODO: fix this :()
  openItem: any;
}) {
  const { t } = useTranslation('common');
  const { isShowing, open, close } = useToggle();
  const { isAuthenticated } = useUser();
  return (
    <>
      <OpenItem onClick={open}>
        <PiGearLight size={20} />
        {t('settings')}
      </OpenItem>
      <Modal title={t('settings')} opened={isShowing} close={close}>
        <LangSelector />
        <hr />
        <ThemeSwitcher />
        {isAuthenticated && (
          <>
            <hr />
            <Link href={route('auth.logout').url}>{t('logout')}</Link>
          </>
        )}
      </Modal>
    </>
  );
}
