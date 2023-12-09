import clsx from 'clsx';
import * as Keys from 'constants/keys';
import PATHS from 'constants/paths';
import { AnimatePresence } from 'framer-motion';
import useGlobalHotkeys from 'hooks/useGlobalHotkeys';
import useModal from 'hooks/useModal';
import { signOut } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useHotkeys } from 'react-hotkeys-hook';
import { FaUser } from 'react-icons/fa';
import { IoLogOutOutline, IoSettingsOutline } from 'react-icons/io5';
import { TfiWorld } from 'react-icons/tfi';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import LangSelector from '../LangSelector';
import Modal from '../Modal/Modal';
import Profile from '../Profile/Profile';
import styles from './settings-modal.module.scss';

export default function SettingsModal() {
  const { t } = useTranslation('common');
  const modal = useModal();
  const { setGlobalHotkeysEnabled } = useGlobalHotkeys();

  setGlobalHotkeysEnabled(!modal.isShowing);

  useHotkeys(Keys.CLOSE_SEARCH_KEY, modal.close, {
    enabled: modal.isShowing,
    enableOnFormTags: ['INPUT'],
  });

  return (
    <>
      <button
        onClick={modal.open}
        className='reset'
        title='Settings'
      >
        <IoSettingsOutline size={24} />
      </button>
      <AnimatePresence>
        {modal.isShowing && (
          <Modal
            title={t('common:settings')}
            close={modal.close}
          >
            <Tabs className={styles['tabs']}>
              <TabList className={clsx('reset', styles['tab-list'])}>
                <Tab
                  className={styles['tab']}
                  selectedClassName={styles['tab-selected']}
                  disabledClassName={styles['tab-disabled']}
                >
                  <FaUser size={18} /> {t('common:profile')}
                </Tab>
                <Tab
                  className={styles['tab']}
                  selectedClassName={styles['tab-selected']}
                  disabledClassName={styles['tab-disabled']}
                >
                  <TfiWorld size={18} /> {t('common:lang')}
                </Tab>
                <button
                  className={clsx('reset', styles['tab'])}
                  style={{ color: 'red' }}
                  onClick={() => signOut({ callbackUrl: PATHS.LOGIN })}
                >
                  <IoLogOutOutline size={18} /> {t('common:logout')}
                </button>
              </TabList>

              <TabPanel
                className={styles['tab-panel']}
                selectedClassName={styles['tab-panel-selected']}
              >
                <Profile />
              </TabPanel>
              <TabPanel
                className={styles['tab-panel']}
                selectedClassName={styles['tab-panel-selected']}
              >
                <p>{t('common:select-your-lang')}</p>
                <LangSelector />
              </TabPanel>
            </Tabs>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
