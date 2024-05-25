import styled from '@emotion/styled';
import { RefObject, useEffect, useRef, useState } from 'react';
import { AiOutlineFolder } from 'react-icons/ai';
import TextEllipsis from '~/components/common/text_ellipsis';
import LinkFavicon from '~/components/dashboard/link/link_favicon';
import useCollections from '~/hooks/use_collections';
import {
  SearchResult,
  SearchResultCollection,
  SearchResultLink,
} from '~/types/search';

const SearchItemStyle = styled('li', {
  shouldForwardProp: (propName) => propName !== 'isActive',
})<{ isActive: boolean }>(({ theme, isActive }) => ({
  fontSize: '16px',
  backgroundColor: isActive ? theme.colors.background : 'transparent',
  display: 'flex',
  gap: '0.35em',
  alignItems: 'center',
  borderRadius: theme.border.radius,
  padding: '0.25em 0.35em !important',
}));

const ItemLegeng = styled.span(({ theme }) => ({
  fontSize: '13px',
  color: theme.colors.grey,
}));

interface CommonResultProps {
  isActive: boolean;
  innerRef: RefObject<HTMLLIElement>;
  onHoverEnter: () => void;
  onHoverLeave: () => void;
}

export default function SearchResultItem({
  result,
  isActive,
  onHover,
}: {
  result: SearchResult;
  isActive: boolean;
  onHover: (result: SearchResult) => void;
}) {
  const itemRef = useRef<HTMLLIElement>(null);
  const [isHovering, setHovering] = useState<boolean>(false);

  const handleHoverEnter = () => {
    if (!isHovering) {
      onHover(result);
      setHovering(true);
    }
  };

  const handleHoverLeave = () => setHovering(false);

  useEffect(() => {
    if (isActive && !isHovering) {
      itemRef.current?.scrollIntoView({
        behavior: 'instant',
        block: 'nearest',
      });
    }
  }, [itemRef, isActive]);

  return result.type === 'collection' ? (
    <ResultCollection
      result={result}
      isActive={isActive}
      onHoverEnter={handleHoverEnter}
      onHoverLeave={handleHoverLeave}
      innerRef={itemRef}
    />
  ) : (
    <ResultLink
      result={result}
      isActive={isActive}
      onHoverEnter={handleHoverEnter}
      onHoverLeave={handleHoverLeave}
      innerRef={itemRef}
    />
  );
}

function ResultLink({
  result,
  isActive,
  innerRef,
  onHoverEnter,
  onHoverLeave,
}: {
  result: SearchResultLink;
} & CommonResultProps) {
  const { collections } = useCollections();
  const collection = collections.find((c) => c.id === result.collection_id);
  const link = collection?.links.find((l) => l.id === result.id);

  if (!collection || !link) return <></>;

  return (
    <SearchItemStyle
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
      isActive={isActive}
      key={result.type + result.id.toString()}
      ref={innerRef}
    >
      <LinkFavicon url={link.url} size={20} />
      <TextEllipsis
        dangerouslySetInnerHTML={{
          __html: result.matched_part ?? result.name,
        }}
      />
      <ItemLegeng>({collection.name})</ItemLegeng>
    </SearchItemStyle>
  );
}

const ResultCollection = ({
  result,
  isActive,
  innerRef,
  onHoverEnter,
  onHoverLeave,
}: {
  result: SearchResultCollection;
} & CommonResultProps) => (
  <SearchItemStyle
    onMouseEnter={onHoverEnter}
    onMouseLeave={onHoverLeave}
    isActive={isActive}
    key={result.type + result.id.toString()}
    ref={innerRef}
  >
    <AiOutlineFolder size={24} />
    <TextEllipsis
      dangerouslySetInnerHTML={{
        __html: result.matched_part ?? result.name,
      }}
    />
  </SearchItemStyle>
);
