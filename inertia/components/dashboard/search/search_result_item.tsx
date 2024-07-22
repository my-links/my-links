import styled from '@emotion/styled';
import { RefObject, useEffect, useRef, useState } from 'react';
import { AiOutlineFolder } from 'react-icons/ai';
import Legend from '~/components/common/legend';
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

interface CommonResultProps {
  innerRef: RefObject<HTMLLIElement>;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
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

  const onMouseEnter = () => {
    if (!isHovering) {
      onHover(result);
      setHovering(true);
    }
  };
  const onMouseLeave = () => setHovering(false);

  useEffect(() => {
    if (isActive && !isHovering) {
      itemRef.current?.scrollIntoView({
        behavior: 'instant',
        block: 'nearest',
      });
    }
  }, [itemRef, isActive]);

  const commonProps = {
    onMouseEnter,
    onMouseLeave,
    isActive,
  };
  return result.type === 'collection' ? (
    <ResultCollection result={result} innerRef={itemRef} {...commonProps} />
  ) : (
    <ResultLink result={result} innerRef={itemRef} {...commonProps} />
  );
}

function ResultLink({
  result,
  innerRef,
  ...props
}: {
  result: SearchResultLink;
} & CommonResultProps) {
  const { collections } = useCollections();
  const collection = collections.find((c) => c.id === result.collection_id);
  const link = collection?.links.find((l) => l.id === result.id);

  if (!collection || !link) return <></>;

  return (
    <SearchItemStyle
      key={result.type + result.id.toString()}
      ref={innerRef}
      {...props}
    >
      <LinkFavicon url={link.url} size={20} />
      <TextEllipsis
        dangerouslySetInnerHTML={{
          __html: result.matched_part ?? result.name,
        }}
      />
      <Legend>({collection.name})</Legend>
    </SearchItemStyle>
  );
}

const ResultCollection = ({
  result,
  innerRef,
  ...props
}: {
  result: SearchResultCollection;
} & CommonResultProps) => (
  <SearchItemStyle
    key={result.type + result.id.toString()}
    ref={innerRef}
    {...props}
  >
    <AiOutlineFolder size={24} />
    <TextEllipsis
      dangerouslySetInnerHTML={{
        __html: result.matched_part ?? result.name,
      }}
    />
  </SearchItemStyle>
);
