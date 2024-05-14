import RoundedImage from '~/components/common/rounded_image';
import { Item } from '~/components/dashboard/side_nav/nav_item';
import useUser from '~/hooks/use_user';

export default function UserCard() {
  const { user, isAuthenticated } = useUser();
  const altImage = `${user?.nickName}'s avatar`;
  return (
    isAuthenticated && (
      <Item className="disable-hover">
        <RoundedImage
          src={user.avatarUrl}
          width={24}
          alt={altImage}
          referrerPolicy="no-referrer"
        />
        {user.nickName}
      </Item>
    )
  );
}
