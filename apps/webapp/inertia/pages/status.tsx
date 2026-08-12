import { Head } from '@inertiajs/react';
import type { Data } from '@generated/data';
import { useLingui } from '@lingui/react/macro';

import { GlobalStatus } from '~/components/status/global_status';
import { ServiceDetails } from '~/components/status/service_details';

interface StatusProps {
	isHealthy: boolean;
	checks: Data.StatusReportCheck[];
}

function Status({ isHealthy, checks }: Readonly<StatusProps>) {
	const { t } = useLingui();

	return (
		<>
			<Head title={t`System Status`} />
			<div className="space-y-6 overflow-y-auto">
				<GlobalStatus isHealthy={isHealthy} />
				<ServiceDetails checks={checks} />
			</div>
		</>
	);
}

export default Status;
