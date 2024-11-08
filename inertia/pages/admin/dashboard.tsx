import { ReactNode } from 'react';
import {
	UsersTable,
	UsersTableProps,
} from '~/components/admin/users/users_table';
import { ContentLayout } from '~/layouts/content_layout';

function AdminDashboardPage(props: UsersTableProps) {
	return <UsersTable {...props} />;
}

AdminDashboardPage.layout = (page: ReactNode) => (
	<ContentLayout children={page} />
);
export default AdminDashboardPage;
