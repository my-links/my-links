import { useTranslation } from 'next-i18next';
import LinkTag from 'next/link';
import { AiOutlineEdit } from 'react-icons/ai';
import { CategoryWithLinks, LinkWithCategory } from 'types';
import styles from './quickactions.module.scss';

export default function EditItem({
  type,
  id,
  onClick,
  className = '',
}: {
  type: 'category' | 'link';
  id: LinkWithCategory['id'] | CategoryWithLinks['id'];
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
