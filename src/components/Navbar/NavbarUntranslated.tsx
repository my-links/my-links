import LinkTag from 'next/link';
import { useSession } from 'next-auth/react';
import PATHS from 'constants/paths';
import styles from './navbar.module.scss';

export default function NavbarUntranslated() {
  const { status } = useSession();

  return (
    <nav className={styles['navbar']}>
      <ul className='reset'>
        <li>
          <LinkTag href={PATHS.HOME}>MyLinks</LinkTag>
        </li>
        <li>
          <LinkTag href={PATHS.REPO_GITHUB}>GitHub</LinkTag>
        </li>
        {status === 'authenticated' ? (
          <li>
            <LinkTag href={PATHS.LOGOUT}>Logout</LinkTag>
          </li>
        ) : (
          <li>
            <LinkTag href={PATHS.LOGIN}>Login</LinkTag>
          </li>
        )}
      </ul>
    </nav>
  );
}
