import { ReactNode } from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';

export default function FavoriteItem({
  isFavorite,
  children,
  onClick,
}: {
  isFavorite: boolean;
  children?: ReactNode;
  onClick: () => void;
}) {
  const starColor = '#ffc107';
  return (
    <div onClick={onClick}>
      {isFavorite ? (
        <AiFillStar color={starColor} />
      ) : (
        <AiOutlineStar color={starColor} />
      )}
      {children && <>{children}</>}
    </div>
  );
}
