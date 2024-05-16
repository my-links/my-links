import styled from '@emotion/styled';
import { Link } from '@inertiajs/react';
import { RxHamburgerMenu } from 'react-icons/rx';
import CollectionControls from '~/components/dashboard/collection/header/collection_controls';
import CollectionDescription from '~/components/dashboard/collection/header/collection_description';
import CollectionHeader from '~/components/dashboard/collection/header/collection_header';
import LinkList from '~/components/dashboard/link/link_list';
import { NoCollection } from '~/components/dashboard/link/no_item';
import Footer from '~/components/footer/footer';
import useActiveCollection from '~/hooks/use_active_collection';

const LinksWrapper = styled.div({
  height: '100%',
  minWidth: 0,
  padding: '0.5em 0.5em 0',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
});

const CollectionHeaderWrapper = styled.h2(({ theme }) => ({
  fontWeight: 400,
  color: theme.colors.font,
  paddingRight: '1.1em',
  display: 'flex',
  gap: '0.4em',
  alignItems: 'center',
  justifyContent: 'space-between',

  '& > svg': {
    display: 'flex',
  },
}));

interface CollectionContainerProps {
  isMobile: boolean;
  openSideMenu: () => void;
}

export default function CollectionContainer({
  isMobile,
  openSideMenu,
}: Readonly<CollectionContainerProps>) {
  const { activeCollection } = useActiveCollection();

  if (activeCollection === null) {
    return <NoCollection />;
  }

  return (
    <LinksWrapper>
      <CollectionHeaderWrapper>
        {isMobile && (
          <Link
            href="/#"
            onClick={(event) => {
              event.preventDefault();
              openSideMenu();
            }}
            title="Open side nav bar"
          >
            <RxHamburgerMenu size={'1.5em'} />
          </Link>
        )}
        <CollectionHeader />
        <CollectionControls collectionId={activeCollection.id} />
      </CollectionHeaderWrapper>
      <CollectionDescription />
      <LinkList links={activeCollection.links} />
      <Footer />
    </LinksWrapper>
  );
}
