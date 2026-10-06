import { Button } from '@minimalstuff/ui';
import { Trans } from '@lingui/react/macro';

import { useImportForm } from '~/hooks/use_import_form';

export function ImportForm() {
	const {
		fileInputRef,
		hasFile,
		processing,
		importError,
		importSuccess,
		handleFileChange,
		handleImport,
	} = useImportForm();

	return (
		<div className="border-t border-gray-200 dark:border-gray-700 pt-6">
			<h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
				<Trans>Import</Trans>
			</h3>
			<form onSubmit={handleImport} className="space-y-4">
				<div>
					<label
						htmlFor="import-file"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
					>
						<Trans>Select JSON file</Trans>
					</label>
					<input
						ref={fileInputRef}
						id="import-file"
						type="file"
						accept=".json,application/json"
						onChange={handleFileChange}
						className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30 cursor-pointer"
					/>
				</div>

				{importError && (
					<div className="text-sm text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
						{importError}
					</div>
				)}

				{importSuccess && (
					<div className="text-sm text-green-600 dark:text-green-400 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
						<Trans>Data imported successfully!</Trans>
					</div>
				)}

				<Button
					type="submit"
					variant="outline"
					color="neutral"
					size="sm"
					disabled={!hasFile || processing}
					className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30"
				>
					{processing && (
						<span
							className="i-svg-spinners-3-dots-fade w-4 h-4"
							aria-hidden="true"
						/>
					)}
					<div className="i-tabler-upload w-4 h-4" />
					<Trans>Import</Trans>
				</Button>
			</form>
		</div>
	);
}
