import { t } from '@lingui/core/macro';
import { Head } from '@inertiajs/react';
import type { Data } from '@generated/data';

import { AppLayout } from '~/layouts/app_layout';
import { AdminTabs } from '~/components/admin/admin_tabs';
import { GlobalStatus } from '~/components/status/global_status';
import { ServiceDetails } from '~/components/status/service_details';
import { AppPageHeader } from '~/components/common/navigation/app_page_header';

interface StatusProps {
	isHealthy: boolean;
	checks: Data.StatusReportCheck[];
}

function Status({ isHealthy, checks }: Readonly<StatusProps>) {
	return (
		<div className="w-full flex flex-col md:h-full p-4">
			<Head title={t`System Status`} />
			<AdminTabs />
			<div className="space-y-6 overflow-y-auto">
				<GlobalStatus isHealthy={isHealthy} />
				<ServiceDetails checks={checks} />
			</div>
		</div>
	);
}

Status.layout = (page: React.ReactNode) => (
	<AppLayout>
		<AppPageHeader title={t`System Status`} />
		{page}
	</AppLayout>
);

export default Status;
