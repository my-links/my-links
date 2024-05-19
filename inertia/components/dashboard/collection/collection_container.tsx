import styled from '@emotion/styled';
import CollectionHeader from '~/components/dashboard/collection/header/collection_header';
import LinkList from '~/components/dashboard/link/link_list';
import { NoCollection } from '~/components/dashboard/link/no_item';
import Footer from '~/components/footer/footer';
import useActiveCollection from '~/hooks/use_active_collection';

const CollectionContainerStyle = styled.div({
  height: '100%',
  minWidth: 0,
  padding: '0.5em 0.5em 0',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
});

interface CollectionContainerProps {
  isMobile: boolean;
  openSideMenu: () => void;
}

export default function CollectionContainer({
  isMobile: _,
  openSideMenu: __,
}: Readonly<CollectionContainerProps>) {
  const { activeCollection } = useActiveCollection();

  if (activeCollection === null) {
    return <NoCollection />;
  }

  return (
    <CollectionContainerStyle>
      <CollectionHeader />
      <LinkList links={activeCollection.links} />
      <Footer css={{ paddingBottom: 0 }} />
    </CollectionContainerStyle>
  );
}
