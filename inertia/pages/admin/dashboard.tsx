import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Table from '~/components/common/table';
import ContentLayout from '~/components/layouts/content_layout';
import { DATE_FORMAT } from '~/constants';
import { UserWithRelationCount } from '~/types/app';

dayjs.extend(relativeTime);

interface AdminDashboardProps {
	users: UserWithRelationCount[];
	totalCollections: number;
	totalLinks: number;
}

const CenteredCell = styled.div({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	flexDirection: 'column',
});

const RenderDateCell = (info: any) => (
	<CenteredCell>
		<span>{dayjs(info.getValue().toString()).fromNow()}</span>
		<span>{dayjs(info.getValue().toString()).format(DATE_FORMAT)}</span>
	</CenteredCell>
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
	const columns = useMemo(
		() =>
			[
				{
					accessorKey: 'id',
					header: (
						<>
							# <span css={{ color: theme.colors.grey }}>({users.length})</span>
						</>
					),
					cell: (info) => info.getValue(),
				},
				{
					accessorKey: 'fullname',
					header: t('common:name'),
					cell: (info) => info.getValue(),
				},
				{
					accessorKey: 'email',
					header: t('common:email'),
					cell: (info) => info.getValue(),
				},
				{
					accessorKey: 'count',
					header: (
						<>
							{t('common:collection.collections', { count: totalCollections })}{' '}
							<span css={{ color: theme.colors.grey }}>
								({totalCollections})
							</span>
						</>
					),
					cell: (info) => (info.getValue() as any)?.collection,
				},
				{
					accessorKey: 'count',
					header: (
						<>
							{t('common:link.links', { count: totalLinks })}{' '}
							<span css={{ color: theme.colors.grey }}>({totalLinks})</span>
						</>
					),
					cell: (info: any) => info.getValue()?.link,
				},
				{
					accessorKey: 'isAdmin',
					header: t('admin:role'),
					cell: (info) =>
						info.getValue() ? (
							<span style={{ color: theme.colors.lightRed }}>
								{t('admin:admin')}
							</span>
						) : (
							<span style={{ color: theme.colors.green }}>
								{t('admin:user')}
							</span>
						),
				},
				{
					accessorKey: 'createdAt',
					header: t('admin:created_at'),
					cell: RenderDateCell,
				},
				{
					accessorKey: 'updatedAt',
					header: t('admin:updated_at'),
					cell: RenderDateCell,
				},
			] as ColumnDef<UserWithRelationCount>[],
		[]
	);
	return <Table columns={columns} data={users} />;
}
