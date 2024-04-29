import styled from '@emotion/styled';
import { Link } from '@inertiajs/react';
import ExternalLink from '~/components/common/external_link';
import RoundedImage from '~/components/common/rounded_image';
import UnstyledList from '~/components/common/unstyled/unstyled_list';
import useUser from '~/hooks/use_user';
import PATHS from '../../../app/constants/paths';

type NavbarListDirection = {
  right?: boolean;
};

const Nav = styled.nav({
  width: '100%',
  padding: '0.75em 0',
  display: 'flex',
  alignItems: 'center',
});

const NavList = styled(UnstyledList)<NavbarListDirection>(
  ({ theme, right }) => ({
    display: 'flex',
    flex: 1,
    gap: '1.5em',
    justifyContent: right ? 'flex-end' : 'flex-start',
    transition: theme.transition.delay,
  })
);

const UserCard = styled.div({
  display: 'flex',
  gap: '0.35em',
  alignItems: 'center',
  justifyContent: 'center',
});

export default function Navbar() {
  const { isAuthenticated, user } = useUser();
  return (
    <Nav>
      <NavList>
        <li>
          <Link href={PATHS.HOME} css={{ fontSize: '24px' }}>
            MyLinks
          </Link>
        </li>
      </NavList>
      <NavList right>
        <li>
          <select>
            <option>EN</option>
          </select>
        </li>
        <li>
          <ExternalLink href={PATHS.REPO_GITHUB}>GitHub</ExternalLink>
        </li>
        {isAuthenticated && !!user ? (
          <>
            <li>
              <Link href={PATHS.DASHBOARD}>Dashboard</Link>
            </li>
            <li>
              <a href={PATHS.AUTH.LOGOUT}>
                <UserCard>
                  <RoundedImage
                    src={user.avatarUrl}
                    width={22}
                    referrerPolicy="no-referrer"
                  />
                  {user.nickName}
                </UserCard>
              </a>
            </li>
          </>
        ) : (
          <li>
            <Link href={PATHS.AUTH.LOGIN}>Login</Link>
          </li>
        )}
      </NavList>
    </Nav>
  );
}
