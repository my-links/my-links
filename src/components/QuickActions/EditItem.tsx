import LinkTag from 'next/link';
import { useTranslation } from 'next-i18next';
import { AiOutlineEdit } from 'react-icons/ai';
import { Category, Link } from 'types';
import styles from './quickactions.module.scss';

export default function EditItem({
  type,
  id,
  onClick,
  className = '',
}: {
  type: 'category' | 'link';
  id: Link['id'] | Category['id'];
  onClick?: (event: any) => void;
  className?: string;
}) {
  const { t } = useTranslation('home');

  return (
    <LinkTag
      href={`/${type}/edit/${id}`}
      title={t(`common:${type}.edit`)}
      className={`${styles['action']} ${className ? className : ''}`}
      onClick={onClick && onClick}
    >
      <AiOutlineEdit />
    </LinkTag>
  );
}
