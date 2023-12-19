import BlockWrapper from 'components/BlockWrapper/BlockWrapper';
import Categories from './Categories/Categories';
import Favorites from './Favorites/Favorites';
import NavigationLinks from './NavigationLinks';
import UserCard from './UserCard/UserCard';
import styles from './side-nav.module.scss';

export default function SideNavigation() {
  return (
    <div className={styles['side-menu']}>
      <BlockWrapper>
        <Favorites />
      </BlockWrapper>
      <BlockWrapper style={{ minHeight: '0', flex: '1' }}>
        <Categories />
      </BlockWrapper>
      <BlockWrapper>
        <NavigationLinks />
      </BlockWrapper>
      <BlockWrapper>
        <UserCard />
      </BlockWrapper>
    </div>
  );
}
