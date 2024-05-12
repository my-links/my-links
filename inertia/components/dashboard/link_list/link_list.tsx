import styled from '@emotion/styled';
import { Link } from '@inertiajs/react';
import { RxHamburgerMenu } from 'react-icons/rx';
import CollectionControls from '~/components/dashboard/collection/collection_controls';
import CollectionDescription from '~/components/dashboard/collection/collection_description';
import CollectionHeader from '~/components/dashboard/collection/collection_header';
import LinkItem from '~/components/dashboard/link_list/link_item';
import { NoCollection, NoLink } from '~/components/dashboard/link_list/no_item';
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
  color: theme.colors.primary,
  paddingInline: '1em',
  display: 'flex',
  gap: '0.4em',
  alignItems: 'center',
  justifyContent: 'space-between',

  '& > svg': {
    display: 'flex',
  },
}));

interface LinksProps {
  isMobile: boolean;
  openSideMenu: () => void;
}

export default function Links({
  isMobile,
  openSideMenu,
}: Readonly<LinksProps>) {
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
        <CollectionControls />
      </CollectionHeaderWrapper>
      <CollectionDescription />
      {activeCollection?.links.length !== 0 ? (
        <LinkListStyle>
          {activeCollection?.links.map((link) => (
            <LinkItem link={link} key={link.id} showUserControls />
          ))}
        </LinkListStyle>
      ) : (
        <NoLink />
      )}
      <Footer />
    </LinksWrapper>
  );
}

const LinkListStyle = styled.ul({
  height: '100%',
  width: '100%',
  minWidth: 0,
  display: 'flex',
  flex: 1,
  gap: '0.5em',
  padding: '3px',
  flexDirection: 'column',
  overflowX: 'hidden',
  overflowY: 'scroll',
});
