import type { Data } from '@generated/data';
import { Badge } from '~/components/common/badge';
import { ThresholdDisplay } from '~/components/status/threshold_display';
import {
	getHealthServiceDisplayName,
	getHealthStatusColorClass,
	getHealthStatusIcon,
	getHealthStatusLabel,
	getHealthStatusVariant,
} from '~/lib/health';

interface ServiceDetailsProps {
	checks: Data.StatusReportCheck[];
}

export const ServiceDetails = ({ checks }: Readonly<ServiceDetailsProps>) => (
	<div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
		<h2 className="text-xl text-gray-900 dark:text-white mb-6">Services</h2>
		<div className="space-y-4">
			{checks.map((check) => {
				const variant = getHealthStatusVariant(check.status);
				const icon = getHealthStatusIcon(check.status);
				const statusColor = getHealthStatusColorClass(check.status);

				return (
					<div
						key={check.name}
						className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
					>
						<i className={`${icon} text-2xl mt-1 ${statusColor}`} />
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-3 mb-1">
								<h3 className="text-lg font-medium text-gray-900 dark:text-white">
									{getHealthServiceDisplayName(check.name)}
								</h3>
								<Badge variant={variant}>
									{getHealthStatusLabel(check.status)}
								</Badge>
							</div>
							{check.message && (
								<p className="text-sm text-gray-600 dark:text-gray-400 break-words">
									{check.message}
								</p>
							)}
							{check.meta && <ThresholdDisplay meta={check.meta} />}
						</div>
					</div>
				);
			})}
		</div>
	</div>
);
