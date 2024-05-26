import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import RoundedImage from '~/components/common/rounded_image';
import TextEllipsis from '~/components/common/text_ellipsis';
import ContentLayout from '~/components/layouts/content_layout';
import { DATE_FORMAT } from '~/constants';
import { sortByCreationDate } from '~/lib/array';
import { UserWithRelationCount } from '~/types/app';

dayjs.extend(relativeTime);

interface AdminDashboardProps {
  users: UserWithRelationCount[];
  totalCollections: number;
  totalLinks: number;
}

const Cell = styled.div<{ column?: boolean; fixed?: boolean }>(
  ({ column, fixed }) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: fixed ? 'unset' : 'center',
    gap: column ? 0 : '0.35em',
    flexDirection: column ? 'column' : 'row',
  })
);

const ThemeProvider = (props: AdminDashboardProps) => (
  <ContentLayout>
    <AdminDashboard {...props} />
  </ContentLayout>
);
export default ThemeProvider;

function AdminDashboard({
  users,
  totalCollections,
  totalLinks,
}: AdminDashboardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <div style={{ overflow: 'auto', marginTop: '1em' }}>
      <table>
        <thead>
          <tr>
            <TableCell type="th">#</TableCell>
            <TableCell type="th">{t('common:name')}</TableCell>
            <TableCell type="th">{t('common:email')}</TableCell>
            <TableCell type="th">
              {t('common:collection.collections', { count: totalCollections })}{' '}
              <span css={{ color: theme.colors.grey }}>
                ({totalCollections})
              </span>
            </TableCell>
            <TableCell type="th">
              {t('common:link.links', { count: totalLinks })}{' '}
              <span css={{ color: theme.colors.grey }}>({totalLinks})</span>
            </TableCell>
            <TableCell type="th">{t('admin:role')}</TableCell>
            <TableCell type="th">{t('admin:created_at')}</TableCell>
            <TableCell type="th">{t('admin:updated_at')}</TableCell>
          </tr>
        </thead>
        <tbody>
          {users.length !== 0 &&
            sortByCreationDate(users).map((user) => (
              <TableUserRow user={user} key={user.id} />
            ))}
        </tbody>
      </table>
    </div>
  );
}

function TableUserRow({ user }: { user: UserWithRelationCount }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id, fullname, avatarUrl, email, isAdmin, createdAt, updatedAt } =
    user;
  return (
    <tr>
      <TableCell type="td">{id}</TableCell>
      <TableCell type="td" fixed>
        {avatarUrl && (
          <RoundedImage
            src={avatarUrl}
            width={24}
            height={24}
            alt={fullname}
            title={fullname}
          />
        )}
        <TextEllipsis>{fullname ?? '-'}</TextEllipsis>
      </TableCell>
      <TableCell type="td">
        <TextEllipsis>{email}</TextEllipsis>
      </TableCell>
      <TableCell type="td">{user.count.collection}</TableCell>
      <TableCell type="td">{user.count.link}</TableCell>
      <TableCell type="td">
        {isAdmin ? (
          <span style={{ color: theme.colors.lightRed }}>
            {t('admin:admin')}
          </span>
        ) : (
          <span style={{ color: theme.colors.green }}>{t('admin:user')}</span>
        )}
      </TableCell>
      <TableCell type="td" column>
        <span>{dayjs(createdAt.toString()).fromNow()}</span>
        <span>{dayjs(createdAt.toString()).format(DATE_FORMAT)}</span>
      </TableCell>
      <TableCell type="td" column>
        <span>{dayjs(updatedAt.toString()).fromNow()}</span>
        <span>{dayjs(updatedAt.toString()).format(DATE_FORMAT)}</span>
      </TableCell>
    </tr>
  );
}

type TableItem = {
  children: ReactNode;
  type: 'td' | 'th';
  fixed?: boolean;
  column?: boolean;
};

function TableCell({ children, type, ...props }: TableItem) {
  const child = <Cell {...props}>{children}</Cell>;
  return type === 'td' ? <td>{child}</td> : <th>{child}</th>;
}
