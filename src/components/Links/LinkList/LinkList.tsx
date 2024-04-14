import clsx from 'clsx';
import { CategoryWithLinks } from 'types/types';
import LinkItem from '../LinkItem';
import styles from '../links.module.scss';

const LinkList = ({
  links,
  showUserControls = false,
}: {
  links: CategoryWithLinks['links'];
  showUserControls: boolean;
}) => (
  <ul className={clsx(styles['links'], 'reset')}>
    {links.map((link, index) => (
      <LinkItem
        link={link}
        index={index}
        key={link.id}
        showUserControls={showUserControls}
      />
    ))}
  </ul>
);

export default LinkList;
