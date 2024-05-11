import styled from '@emotion/styled';
import { MouseEventHandler } from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import ActionStyle from '~/components/dashboard/quick_action/_quick_action_style';

const StartIcon = styled(AiFillStar)(({ theme }) => ({
  color: theme.colors.yellow,
}));
const UnstaredIcon = StartIcon.withComponent(AiOutlineStar);

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
    {isFavorite ? <StartIcon /> : <UnstaredIcon />}
  </QuickLinkFavoriteStyle>
);

export default QuickLinkFavorite;
