import type { Data } from '@generated/data';
import { Head } from '@inertiajs/react';
import { GlobalStatus } from '~/components/status/global_status';
import { ServiceDetails } from '~/components/status/service_details';

interface StatusProps {
	isHealthy: boolean;
	checks: Data.StatusReportCheck[];
}

const Status = ({ isHealthy, checks }: StatusProps) => (
	<>
		<Head title="Statut du système" />
		<div className="space-y-6 overflow-y-auto">
			<GlobalStatus isHealthy={isHealthy} />
			<ServiceDetails checks={checks} />
		</div>
	</>
);

export default Status;
