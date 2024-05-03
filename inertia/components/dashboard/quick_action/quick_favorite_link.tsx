import { MouseEventHandler } from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import ActionStyle from '~/components/dashboard/quick_action/_quick_action_style';
import { theme } from '~/styles/theme';

const QuickLinkFavoriteStyle = ActionStyle.withComponent('div');
const QuickLinkFavorite = ({
  isFavorite,
  onClick,
}: {
  isFavorite?: boolean;
  onClick: MouseEventHandler<HTMLDivElement>;
}) => (
  <QuickLinkFavoriteStyle
    onClick={onClick ? (event) => onClick(event) : undefined}
  >
    {isFavorite ? (
      <AiFillStar color={theme.colors.yellow} />
    ) : (
      <AiOutlineStar color={theme.colors.yellow} />
    )}
  </QuickLinkFavoriteStyle>
);

export default QuickLinkFavorite;
