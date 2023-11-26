import { AnimatePresence } from 'framer-motion';
import useModal from 'hooks/useModal';
import Modal from '../Modal/Modal';
import * as Keys from 'constants/keys';
import { useHotkeys } from 'react-hotkeys-hook';
import { IoLogOutOutline, IoSettingsOutline } from 'react-icons/io5';
import LangSelector from '../LangSelector';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { TfiWorld } from 'react-icons/tfi';
import { signOut } from 'next-auth/react';
import PATHS from 'constants/paths';
import styles from './settings-modal.module.scss';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { FaUser } from 'react-icons/fa';
import Profile from '../Profile/Profile';

export default function SettingsModal() {
  const { t } = useTranslation('common');
  const modal = useModal();
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
