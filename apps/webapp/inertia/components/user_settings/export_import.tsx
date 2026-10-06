import { Button } from '@minimalstuff/ui';
import { Trans } from '@lingui/react/macro';

import { urlFor } from '~/lib/tuyau';
import { ImportForm } from '~/components/user_settings/import_form';

export function ExportImport() {
	const handleExport = () => {
		const exportUrl = urlFor('user.settings.export');
		window.location.href = exportUrl;
	};

	return (
		<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
			<div className="mb-4">
				<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
					<Trans>Export / Import</Trans>
				</h2>
				<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
					<Trans>
						Export all your collections and links, or import them from a JSON
						file
					</Trans>
				</p>
			</div>

			<div className="space-y-6">
				<div>
					<h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
						<Trans>Export</Trans>
					</h3>
					<Button
						variant="outline"
						color="neutral"
						size="sm"
						onClick={handleExport}
					>
						<div className="i-tabler-download w-4 h-4" />
						<Trans>Download JSON</Trans>
					</Button>
				</div>

				<ImportForm />
			</div>
		</div>
	);
}
