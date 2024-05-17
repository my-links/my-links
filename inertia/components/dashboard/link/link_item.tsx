import type Link from '#models/link';
import styled from '@emotion/styled';
import { AiFillStar } from 'react-icons/ai';
import ExternalLink from '~/components/common/external_link';
import LinkControls from '~/components/dashboard/link/link_controls';
import LinkFavicon from '~/components/dashboard/link/link_favicon';

const LinkWrapper = styled.li(({ theme }) => ({
  userSelect: 'none',
  cursor: 'pointer',
  height: 'fit-content',
  width: '100%',
  color: theme.colors.primary,
  backgroundColor: theme.colors.secondary,
  padding: '0.75em 1em',
  borderRadius: theme.border.radius,

  '&:hover': {
    outlineWidth: '1px',
    outlineStyle: 'solid',
  },
}));

const LinkHeader = styled.div(({ theme }) => ({
  display: 'flex',
  gap: '1em',
  alignItems: 'center',

  '& > a': {
    height: '100%',
    maxWidth: 'calc(100% - 75px)', // TODO: fix this, it is ugly af :(
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

const StarIcon = styled(AiFillStar)(({ theme }) => ({
  color: theme.colors.yellow,
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
  return (
    <LinkWrapper key={id}>
      <LinkHeader>
        <LinkFavicon url={url} />
        <ExternalLink href={url} className="reset">
          <LinkName>
            {name} {showUserControls && favorite && <StarIcon />}
          </LinkName>
          <LinkItemURL url={url} />
        </ExternalLink>
        {showUserControls && <LinkControls link={link} />}
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
