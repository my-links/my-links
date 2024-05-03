import PATHS from '#constants/paths';
import type Link from '#models/link';
import styled from '@emotion/styled';
import { useCallback } from 'react';
import { AiFillStar } from 'react-icons/ai';
import ExternalLink from '~/components/common/external_link';
import LinkFavicon from '~/components/dashboard/link/link_favicon';
import QuickResourceAction from '~/components/dashboard/quick_action/quick_action';
import QuickLinkFavorite from '~/components/dashboard/quick_action/quick_favorite_link';
import useCollections from '~/hooks/use_collections';
import { makeRequest } from '~/lib/request';
import { theme as globalTheme } from '~/styles/theme';

const LinkWrapper = styled.li(({ theme }) => ({
  userSelect: 'none',
  cursor: 'pointer',
  height: 'fit-content',
  width: '100%',
  color: theme.colors.primary,
  backgroundColor: theme.colors.white,
  padding: '0.75em 1em',
  border: `1px solid ${theme.colors.lightestGrey}`,
  borderRadius: theme.border.radius,
  outline: '3px solid transparent',
}));

const LinkHeader = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  '& > a': {
    height: '100%',
    maxWidth: 'calc(100% - 125px)', // TODO: fix this, it is ugly af :(
    textDecoration: 'none',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    transition: theme.transition.delay,

    '&, &:hover': {
      border: 0,
    },
  },
}));

const LinkName = styled.div({
  width: '100%',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
});

const LinkControls = styled.div({
  display: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',

  '& svg': {
    height: '20px',
    width: '20px',
  },

  '&:hover *': {
    transform: 'scale(1.3)',
  },
});

const LinkDescription = styled.div(({ theme }) => ({
  marginTop: '0.5em',
  color: theme.colors.font,
  fontSize: '0.8em',
  wordWrap: 'break-word',
}));

const LinkUrl = styled.span(({ theme }) => ({
  width: '100%',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  color: theme.colors.grey,
  fontSize: '0.8em',
}));

const LinkUrlPathname = styled.span({
  opacity: 0,
});

export default function LinkItem({
  link,
  showUserControls = false,
}: {
  link: Link;
  showUserControls: boolean;
}) {
  const { id, name, url, description, favorite } = link;
  const { collections, setCollections } = useCollections();

  const toggleFavorite = useCallback(
    (linkId: Link['id']) => {
      let linkIndex = 0;
      const collectionIndex = collections.findIndex(({ links }) => {
        const lIndex = links.findIndex((l) => l.id === linkId);
        if (lIndex !== -1) {
          linkIndex = lIndex;
        }
        return lIndex !== -1;
      });

      const collectionLink = collections[collectionIndex].links[linkIndex];
      const collectionsCopy = [...collections];
      collectionsCopy[collectionIndex].links[linkIndex] = {
        ...collectionLink,
        favorite: !collectionLink.favorite,
      };

      setCollections(collectionsCopy);
    },
    [collections, setCollections]
  );

  const onFavorite = () => {
    makeRequest({
      url: `${PATHS.API.LINK}/${link.id}`,
      method: 'PUT',
      body: {
        name,
        url,
        favorite: !favorite,
        collectionId: link.collectionId,
      },
    })
      .then(() => toggleFavorite(link.id))
      .catch(console.error);
  };

  return (
    <LinkWrapper key={id}>
      <LinkHeader>
        <LinkFavicon url={url} />
        <ExternalLink href={url} className="reset">
          <LinkName>
            {name}{' '}
            {showUserControls && favorite && (
              <AiFillStar color={globalTheme.colors.yellow} />
            )}
          </LinkName>
          <LinkItemURL url={url} />
        </ExternalLink>
        {showUserControls && (
          <LinkControls>
            <QuickLinkFavorite onClick={onFavorite} isFavorite={favorite} />
            <QuickResourceAction
              resource="link"
              action="edit"
              resourceId={id}
            />
            <QuickResourceAction
              resource="link"
              action="remove"
              resourceId={id}
            />
          </LinkControls>
        )}
      </LinkHeader>
      {description && <LinkDescription>{description}</LinkDescription>}
    </LinkWrapper>
  );
}

function LinkItemURL({ url }: { url: Link['url'] }) {
  try {
    const { origin, pathname, search } = new URL(url);
    let text = '';

    if (pathname !== '/') {
      text += pathname;
    }

    if (search !== '') {
      if (text === '') {
        text += '/';
      }
      text += search;
    }

    return (
      <LinkUrl>
        {origin}
        <LinkUrlPathname>{text}</LinkUrlPathname>
      </LinkUrl>
    );
  } catch (error) {
    console.error('error', error);
    return <LinkUrl>{url}</LinkUrl>;
  }
}
