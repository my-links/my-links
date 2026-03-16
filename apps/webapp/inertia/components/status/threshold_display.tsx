import type { Data } from '@generated/data';
import { formatBytes, formatPercentage } from '~/lib/format';

interface ThresholdDisplayProps {
	meta: Data.StatusReportCheck['meta'];
}

export const ThresholdDisplay = ({ meta }: Readonly<ThresholdDisplayProps>) => {
	if (meta?.sizeInPercentage) {
		const { used, warningThreshold, failureThreshold } = meta.sizeInPercentage;
		return (
			<div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
				<div className="flex items-center justify-between text-sm">
					<span className="text-gray-600 dark:text-gray-400">Utilisation</span>
					<span className="font-medium text-gray-900 dark:text-white">
						{formatPercentage(used)}
					</span>
				</div>
				<div className="flex items-center justify-between text-xs mt-1 text-gray-500 dark:text-gray-500">
					<span>Avertissement</span>
					<span>{formatPercentage(warningThreshold)}</span>
				</div>
				<div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
					<span>Erreur</span>
					<span>{formatPercentage(failureThreshold)}</span>
				</div>
			</div>
		);
	}

	if (meta?.memoryInBytes) {
		const { used, warningThreshold, failureThreshold } = meta.memoryInBytes;
		return (
			<div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
				<div className="flex items-center justify-between text-sm">
					<span className="text-gray-600 dark:text-gray-400">Utilisation</span>
					<span className="font-medium text-gray-900 dark:text-white">
						{formatBytes(used)}
					</span>
				</div>
				<div className="flex items-center justify-between text-xs mt-1 text-gray-500 dark:text-gray-500">
					<span>Avertissement</span>
					<span>{formatBytes(warningThreshold)}</span>
				</div>
				<div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
					<span>Erreur</span>
					<span>{formatBytes(failureThreshold)}</span>
				</div>
			</div>
		);
	}

	if (meta?.connectionsCount) {
		const { active, warningThreshold, failureThreshold } =
			meta.connectionsCount;
		return (
			<div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
				<div className="flex items-center justify-between text-sm">
					<span className="text-gray-600 dark:text-gray-400">
						Connexions actives
					</span>
					<span className="font-medium text-gray-900 dark:text-white">
						{active}
					</span>
				</div>
				<div className="flex items-center justify-between text-xs mt-1 text-gray-500 dark:text-gray-500">
					<span>Avertissement</span>
					<span>{warningThreshold}</span>
				</div>
				<div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
					<span>Erreur</span>
					<span>{failureThreshold}</span>
				</div>
			</div>
		);
	}

	return null;
};
