import { Visibility } from '@prisma/client';
import { IoEarthOutline } from 'react-icons/io5';
import styles from './visibility.module.scss';

const VisibilityBadge = ({
  label,
  visibility,
}: {
  label: string;
  visibility: Visibility;
}) =>
  visibility === Visibility.public && (
    <span className={styles['visibility']}>
      {label} <IoEarthOutline size='1em' />
    </span>
  );

export default VisibilityBadge;
