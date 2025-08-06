import {
	UsersTable,
	UsersTableProps,
} from '~/components/admin/users/users_table';

export default function AdminDashboardPage(props: UsersTableProps) {
	return <UsersTable {...props} />;
}
