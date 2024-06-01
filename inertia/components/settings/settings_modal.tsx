import { useTranslation } from 'react-i18next';
import { CiDark } from 'react-icons/ci';
import { FaUser } from 'react-icons/fa';
import { IoLanguageOutline } from 'react-icons/io5';
import { PiGearLight } from 'react-icons/pi';
import FormField from '~/components/common/form/_form_field';
import Modal from '~/components/common/modal/modal';
import Tabs, { Tab } from '~/components/common/tabs/tabs';
import LangSelector from '~/components/lang_selector';
import Profile from '~/components/settings/profile';
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

  let tabs: Tab[] = [
    {
      title: t('lang'),
      content: <LangSelector />,
      icon: IoLanguageOutline,
    },
    {
      title: 'Theme',
      content: (
        <FormField css={{ flexDirection: 'row' }}>
          <label>Dark theme?</label>
          <ThemeSwitcher />
        </FormField>
      ),
      icon: CiDark,
    },
  ];

  if (isAuthenticated) {
    tabs.push({
      title: t('profile'),
      content: <Profile />,
      icon: FaUser,
    });
  }

  return (
    <>
      <OpenItem onClick={open}>
        <PiGearLight size={20} />
        {t('settings')}
      </OpenItem>
      <Modal
        title={t('settings')}
        opened={isShowing}
        close={close}
        css={{ justifyContent: 'flex-start' }}
      >
        <Tabs tabs={tabs} />
      </Modal>
    </>
  );
}
