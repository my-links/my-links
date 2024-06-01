import { Theme } from '@emotion/react';
import { useMediaQuery } from '~/hooks/viewport/use_media_query';
import { media } from '~/styles/media_queries';

type ScreenTypes = keyof Theme['media'];
const useScreenType = (screen: ScreenTypes) =>
  useMediaQuery(`(max-width: ${media[screen]})`);

export default useScreenType;
