import ButtonLink from 'components/ButtonLink';
import Footer from 'components/Footer/Footer';
import CreateItem from 'components/QuickActions/CreateItem';
import EditItem from 'components/QuickActions/EditItem';
import RemoveItem from 'components/QuickActions/RemoveItem';
import useActiveCategory from 'hooks/useActiveCategory';
import useUser from 'hooks/useUser';
import { useTranslation } from 'next-i18next';
import LinkTag from 'next/link';
import { RxHamburgerMenu } from 'react-icons/rx';
import CategoryDescription from './CategoryDescription/CategoryDescription';
import CategoryHeader from './CategoryHeader/CategoryHeader';
import LinkList from './LinkList/LinkList';
import NoLinkItem from './LinkList/NoLinkItem';
import styles from './links.module.scss';

interface LinksProps {
  isMobile: boolean;
  openSideMenu: () => void;
}

export default function Links({
  isMobile,
  openSideMenu,
}: Readonly<LinksProps>) {
  const { status } = useUser();
  const { t } = useTranslation('home');
  const { activeCategory } = useActiveCategory();

  if (activeCategory === null) {
    return (
      <div className={styles['no-category']}>
        <p>{t('home:select-category')}</p>
        <LinkTag href='/category/create'>{t('home:or-create-one')}</LinkTag>
      </div>
    );
  }

  const { id, name, description, links } = activeCategory;
  return (
    <div className={styles['links-wrapper']}>
      <h2 className={styles['category-header']}>
        {isMobile && (
          <ButtonLink
            onClick={openSideMenu}
            title='Open side nav bar'
          >
            <RxHamburgerMenu size={'1.5em'} />
          </ButtonLink>
        )}
        <CategoryHeader activeCategory={activeCategory} />
        {status === 'authenticated' && (
          <span className={styles['category-controls']}>
            <CreateItem
              type='link'
              categoryId={id}
            />
            <EditItem
              type='category'
              id={id}
            />
            <RemoveItem
              type='category'
              id={id}
            />
          </span>
        )}
      </h2>
      <CategoryDescription description={description} />
      {links.length !== 0 ? (
        <LinkList
          links={links}
          showUserControls
        />
      ) : (
        <NoLinkItem
          categoryId={id}
          categoryName={name}
          key={id}
        />
      )}
      <Footer />
    </div>
  );
}
