import { useTranslation } from 'next-i18next';
import LinkTag from 'next/link';
import { IoAddOutline } from 'react-icons/io5';
import { CategoryWithLinks } from 'types';
import styles from './quickactions.module.scss';

export default function CreateItem({
  type,
  categoryId,
  onClick,
}: {
  type: 'category' | 'link';
  categoryId?: CategoryWithLinks['id'];
  onClick?: (event: any) => void;
}) {
  const { t } = useTranslation('home');

  return (
    <LinkTag
      href={`/${type}/create${categoryId && `?categoryId=${categoryId}`}`}
      title={t(`common:${type}.create`)}
      className={styles['action']}
      onClick={onClick && onClick}
    >
      <IoAddOutline />
    </LinkTag>
  );
}
