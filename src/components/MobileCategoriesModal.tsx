import PATHS from 'constants/paths';
import { AnimatePresence } from 'framer-motion';
import useModal from 'hooks/useModal';
import { useTranslation } from 'next-i18next';
import { RxHamburgerMenu } from 'react-icons/rx';
import BlockWrapper from './BlockWrapper/BlockWrapper';
import ButtonLink from './ButtonLink';
import Modal from './Modal/Modal';
import Categories from './SideMenu/Categories/Categories';

export default function MobileCategoriesModal() {
  const { t } = useTranslation();
  const mobileModal = useModal();

  return (
    <>
      <ButtonLink
        style={{
          display: 'flex',
        }}
        onClick={mobileModal.open}
        title='Open side nav bar'
      >
        <RxHamburgerMenu size={'1.5em'} />
      </ButtonLink>
      <AnimatePresence>
        {mobileModal.isShowing && (
          <Modal close={mobileModal.close}>
            <BlockWrapper style={{ minHeight: '0', flex: '1' }}>
              <ButtonLink href={PATHS.CATEGORY.CREATE}>
                {t('common:category.create')}
              </ButtonLink>
              <Categories />
            </BlockWrapper>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
