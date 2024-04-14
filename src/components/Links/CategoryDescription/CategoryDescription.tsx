import { CategoryWithLinks } from 'types/types';
import styles from './category-description.module.scss';

const CategoryDescription = ({
  description,
}: {
  description?: CategoryWithLinks['description'];
}) =>
  description && (
    <p className={styles['category-description']}>{description}</p>
  );

export default CategoryDescription;
