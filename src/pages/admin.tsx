import { User } from '@prisma/client';
import clsx from 'clsx';
import Navbar from 'components/Navbar/Navbar';
import PageTransition from 'components/PageTransition';
import RoundedImage from 'components/RoundedImage/RoundedImage';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getServerSideTranslation } from 'i18n';
import getUsers from 'lib/user/getUsers';
import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import styles from 'styles/admin.module.scss';
import { withAuthentication } from 'utils/session';

dayjs.extend(relativeTime);

type UserExtended = User & { _count: { categories: number; links: number } };

export default function AdminDashboard({ users }: { users: UserExtended[] }) {
  const { t } = useTranslation('common');
  return (
    <PageTransition className={styles['admin']}>
      <Navbar />
      <Tabs>
        <TabList>
          <Tab>{t('common:users')}</Tab>
          <Tab>{t('common:stats')}</Tab>
        </TabList>

        <TabPanel>
          <p>
            {users.length} {t('admin:users')}
          </p>
          <table>
            <thead>
              <tr>
                <TH>#</TH>
                <TH>{t('common:name')}</TH>
                <TH>{t('common:email')}</TH>
                <TH>{t('common:category.categories')}</TH>
                <TH>{t('common:link.links')}</TH>
                <TH>{t('admin:role')}</TH>
                <TH>{t('admin:created_at')}</TH>
                <TH>{t('admin:updated_at')}</TH>
              </tr>
            </thead>
            <tbody>
              {users.length !== 0 &&
                users.map(
                  ({
                    id,
                    image,
                    name,
                    email,
                    _count,
                    is_admin,
                    createdAt,
                    updatedAt,
                  }) => (
                    <tr key={id}>
                      <TD>{id}</TD>
                      <TD fixed>
                        {image && (
                          <RoundedImage
                            src={image}
                            width={24}
                            height={24}
                            alt={name}
                            title={name}
                          />
                        )}
                        {name ?? '-'}
                      </TD>
                      <TD>{email}</TD>
                      <TD>{_count.categories}</TD>
                      <TD>{_count.links}</TD>
                      <TD>
                        {is_admin ? (
                          <span style={{ color: 'red' }}>
                            {t('admin:admin')}
                          </span>
                        ) : (
                          <span style={{ color: 'green' }}>
                            {t('admin:user')}
                          </span>
                        )}
                      </TD>
                      <TD>{dayjs(createdAt).fromNow()}</TD>
                      <TD>{dayjs(updatedAt).fromNow()}</TD>
                    </tr>
                  ),
                )}
            </tbody>
          </table>
        </TabPanel>
        <TabPanel>{/* // stats */}</TabPanel>
      </Tabs>
    </PageTransition>
  );
}

type TableItem = { children: ReactNode; fixed?: boolean };
function TH({ children, fixed = false }: TableItem) {
  return (
    <th>
      <div className={clsx('cell', fixed && 'fixed')}>{children}</div>
    </th>
  );
}

function TD({ children, fixed = false }: TableItem) {
  return (
    <td>
      <div className={clsx('cell', fixed && 'fixed')}>{children}</div>
    </td>
  );
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
