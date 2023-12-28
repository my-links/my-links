import { User } from '@prisma/client';
import clsx from 'clsx';
import Navbar from 'components/Navbar/Navbar';
import PageTransition from 'components/PageTransition';
import RoundedImage from 'components/RoundedImage/RoundedImage';
import { DATE_FORMAT } from 'constants/date';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getServerSideTranslation } from 'i18n';
import getUsers from 'lib/user/getUsers';
import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';
import 'react-tabs/style/react-tabs.css';
import styles from 'styles/admin.module.scss';
import { withAuthentication } from 'utils/session';

dayjs.extend(relativeTime);

type UserExtended = User & { _count: { categories: number; links: number } };

export default function AdminDashboard({ users }: { users: UserExtended[] }) {
  const { t } = useTranslation();
  const totalCategories = users.reduce(
    (acc, user) => (acc = acc + user._count.categories),
    0,
  );
  const totalLinks = users.reduce(
    (acc, user) => (acc = acc + user._count.links),
    0,
  );
  return (
    <PageTransition className={styles['admin']}>
      <Navbar />
      <div style={{ overflow: 'auto', marginTop: '1em' }}>
        <table>
          <thead>
            <tr>
              <TableCell type='th'>#</TableCell>
              <TableCell type='th'>{t('common:name')}</TableCell>
              <TableCell type='th'>{t('common:email')}</TableCell>
              <TableCell type='th'>
                {t('common:category.categories')} <b>({totalCategories})</b>
              </TableCell>
              <TableCell type='th'>
                {t('common:link.links')} <b>({totalLinks})</b>
              </TableCell>
              <TableCell type='th'>{t('admin:role')}</TableCell>
              <TableCell type='th'>{t('admin:created_at')}</TableCell>
              <TableCell type='th'>{t('admin:updated_at')}</TableCell>
            </tr>
          </thead>
          <tbody>
            {users.length !== 0 &&
              users.map((user) => (
                <TableUserRow
                  user={user}
                  key={user.id}
                />
              ))}
          </tbody>
        </table>
      </div>
    </PageTransition>
  );
}

function TableUserRow({ user }: { user: UserExtended }) {
  const { t } = useTranslation();
  const { id, image, name, email, _count, is_admin, createdAt, updatedAt } =
    user;
  return (
    <tr>
      <TableCell type='td'>{id}</TableCell>
      <TableCell
        type='td'
        fixed
      >
        {image && (
          <RoundedImage
            src={image}
            width={32}
            height={32}
            alt={name}
            title={name}
          />
        )}
        {name ?? '-'}
      </TableCell>
      <TableCell type='td'>{email}</TableCell>
      <TableCell type='td'>{_count.categories}</TableCell>
      <TableCell type='td'>{_count.links}</TableCell>
      <TableCell type='td'>
        {is_admin ? (
          <span style={{ color: 'red' }}>{t('admin:admin')}</span>
        ) : (
          <span style={{ color: 'green' }}>{t('admin:user')}</span>
        )}
      </TableCell>
      <TableCell
        type='td'
        column
      >
        <span>{dayjs(createdAt).fromNow()}</span>
        <span>{dayjs(createdAt).format(DATE_FORMAT)}</span>
      </TableCell>
      <TableCell type='td'>{dayjs(updatedAt).fromNow()}</TableCell>
    </tr>
  );
}

type TableItem = {
  children: ReactNode;
  fixed?: boolean;
  column?: boolean;
  type: 'td' | 'th';
};

function TableCell({
  children,
  fixed = false,
  column = false,
  type,
}: TableItem) {
  const child = (
    <div className={clsx('cell', fixed && 'fixed', column && 'column')}>
      {children}
    </div>
  );
  return type === 'td' ? <td>{child}</td> : <th>{child}</th>;
}

export const getServerSideProps = withAuthentication(
  async ({ session, locale, user }) => {
    if (!user.is_admin) {
      return {
        redirect: {
          destination: '/',
        },
      };
    }

    const users = await getUsers(session);
    return {
      props: {
        session,
        ...(await getServerSideTranslation(locale, ['admin'])),
        users: JSON.parse(JSON.stringify(users)),
      },
    };
  },
);
