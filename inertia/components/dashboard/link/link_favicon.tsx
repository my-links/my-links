import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { TbLoader3 } from 'react-icons/tb';
import { TfiWorld } from 'react-icons/tfi';
import { rotate } from '~/styles/keyframes';

const IMG_LOAD_TIMEOUT = 7_500;

interface LinkFaviconProps {
  url: string;
  size?: number;
  noMargin?: boolean;
}

const Favicon = styled.div({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});
const FaviconLoader = styled.div(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  backgroundColor: theme.colors.white,

  '& > *': {
    animation: `${rotate} 1s both reverse infinite linear`,
  },
}));

// The Favicon API should always return an image, so it's not really useful to keep the loader nor placeholder icon,
// but for slow connections and other random stuff, I'll keep this
export default function LinkFavicon({
  url,
  size = 32,
  noMargin = false,
}: LinkFaviconProps) {
  const [isFailed, setFailed] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);

  const setFallbackFavicon = () => setFailed(true);
  const handleStopLoading = () => setLoading(false);

  const handleErrorLoading = () => {
    setFallbackFavicon();
    handleStopLoading();
  };

  useEffect(() => {
    if (!isLoading) return;
    const id = setTimeout(() => handleErrorLoading(), IMG_LOAD_TIMEOUT);
    return () => clearTimeout(id);
  }, [isLoading]);

  return (
    <Favicon style={{ marginRight: !noMargin ? '1em' : '0' }}>
      {!isFailed ? (
        <img
          src={`/favicon?urlParam=${url}`}
          onError={handleErrorLoading}
          onLoad={handleStopLoading}
          height={size}
          width={size}
          alt="icon"
        />
      ) : (
        <TfiWorld size={size} />
      )}
      {isLoading && (
        <FaviconLoader style={{ height: `${size}px`, width: `${size}px` }}>
          <TbLoader3 size={size} />
        </FaviconLoader>
      )}
    </Favicon>
  );
}
