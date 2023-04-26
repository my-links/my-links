import { ReactNode, useState } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";

export default function FavoriteItem({
  isFavorite,
  children,
  onClick,
}: {
  isFavorite: boolean;
  children?: ReactNode;
  onClick?: (event: any) => void; // FIXME: find good event type
}) {
  const starColor = "#ffc107";
  const [isItemFavorite, setFavorite] = useState<boolean>(isFavorite);

  const handleClick = (event) => {
    onClick && onClick(event);
    setFavorite((v) => !v);
  };

  return (
    <div onClick={handleClick}>
      {isItemFavorite ? (
        <AiFillStar color={starColor} />
      ) : (
        <AiOutlineStar color={starColor} />
      )}
      {children && <>{children}</>}
    </div>
  );
}
