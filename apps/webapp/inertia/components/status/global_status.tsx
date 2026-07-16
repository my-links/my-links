import { Badge } from '~/components/common/badge';
import { getHealthStatusIcon, getHealthStatusVariant } from '~/lib/health';

interface GlobalStatusProps {
	isHealthy: boolean;
}

export function GlobalStatus({ isHealthy }: Readonly<GlobalStatusProps>) {
	const overallStatus = isHealthy
		? ('healthy' as const)
		: ('unhealthy' as const);
	const overallVariant = getHealthStatusVariant(overallStatus);
	const overallIcon = getHealthStatusIcon(overallStatus);

	return (
		<div
			className={`bg-white dark:bg-gray-800 rounded-lg p-8 border-2 ${
				isHealthy
					? 'border-green-200 dark:border-green-800'
					: 'border-red-200 dark:border-red-800'
			}`}
		>
			<div className="flex items-center gap-4">
				<i
					className={`${overallIcon} text-4xl ${
						isHealthy
							? 'text-green-600 dark:text-green-400'
							: 'text-red-600 dark:text-red-400'
					}`}
				/>
				<div className="flex-1">
					<div className="flex items-center gap-3 mb-2">
						<h2 className="text-2xl text-gray-900 dark:text-white">
							Statut global
						</h2>
						<Badge variant={overallVariant}>
							{isHealthy ? 'Opérationnel' : 'Défaillant'}
						</Badge>
					</div>
					<p className="text-gray-600 dark:text-gray-400">
						{isHealthy
							? 'Tous les services sont opérationnels'
							: 'Un ou plusieurs services rencontrent des problèmes'}
					</p>
				</div>
			</div>
		</div>
	);
}
