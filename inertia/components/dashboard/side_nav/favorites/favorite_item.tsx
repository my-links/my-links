import type Link from '#models/link';
import styled from '@emotion/styled';
import ExternalLink from '~/components/common/external_link';
import LinkFavicon from '~/components/dashboard/link/link_favicon';

const FavoriteLinkStyle = styled.li(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.colors.white,
  padding: 0,
  border: `1px solid ${theme.colors.lightestGrey}`,
  borderBottom: `2px solid ${theme.colors.lightestGrey}`,
  borderRadius: theme.border.radius,
  transition: theme.transition.delay,

  '&:hover': {
    color: theme.colors.blue,
    backgroundColor: theme.colors.lightGrey,
    borderBottom: `2px solid ${theme.colors.blue}`,
  },
}));

const LinkStyle = styled(ExternalLink)({
  width: '100%',
  color: 'inherit',
  padding: '0.5em 1em',
  border: '0 !important',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25em',
});

const LinkName = styled.span({
  display: 'block',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
});

const CollectionName = styled.span(({ theme }) => ({
  maxWidth: '75px',
  fontSize: '0.85em',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: theme.colors.grey,
  display: 'block',
  overflow: 'hidden',
}));

const FavoriteItem = ({
  link,
}: Readonly<{
  link: Link;
}>) => (
  <FavoriteLinkStyle>
    <LinkStyle
      href={link.url}
      target="_blank"
      rel="noreferrer"
      title={link.name}
    >
      <LinkFavicon url={link.url} size={24} noMargin />
      <LinkName>{link.name}</LinkName>
      <CollectionName> - {link.collection.name}</CollectionName>
    </LinkStyle>
  </FavoriteLinkStyle>
);
export default FavoriteItem;
