import ButtonLink from 'components/ButtonLink';
import { BiSearchAlt } from 'react-icons/bi';
import styles from './quickactions.module.scss';

export default function QuickActionSearch({
  openSearchModal,
}: {
  openSearchModal: () => void;
}) {
  return (
    <ButtonLink
      className={styles['action']}
      onClick={openSearchModal}
    >
      <BiSearchAlt />
    </ButtonLink>
  );
}
