import { router, useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { useRef, useState } from 'react';
import { Button } from '~/components/common/button';
import { useRouteHelper } from '~/lib/route_helper';

export function ExportImport() {
	const { url } = useRouteHelper();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [importError, setImportError] = useState<string | null>(null);
	const [importSuccess, setImportSuccess] = useState(false);

	const { data, setData, processing } = useForm<{
		file: File | null;
	}>({
		file: null,
	});

	const handleExport = () => {
		const exportUrl = url('user.settings.export');
		window.location.href = exportUrl;
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		setData('file', file);
		setImportError(null);
		setImportSuccess(false);
	};

	const handleImport = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setImportError(null);
		setImportSuccess(false);

		if (!data.file) {
			setImportError('Please select a file');
			return;
		}

		const importUrl = url('user.settings.import');
		const formData = new FormData();
		formData.append('file', data.file);

		router.post(importUrl, formData, {
			forceFormData: true,
			onSuccess: () => {
				setImportSuccess(true);
				setData('file', null);
				if (fileInputRef.current) {
					fileInputRef.current.value = '';
				}
				setTimeout(() => {
					router.reload();
				}, 1000);
			},
			onError: (errors: any) => {
				setImportError(
					errors.error || errors.file || 'An error occurred during import'
				);
			},
		});
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
						variant="secondary"
						size="sm"
						onClick={handleExport}
						className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30"
					>
						<div className="i-tabler-download w-4 h-4" />
						<Trans>Download JSON</Trans>
					</Button>
				</div>

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
							variant="secondary"
							size="sm"
							loading={processing}
							disabled={!data.file || processing}
							className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30"
						>
							<div className="i-tabler-upload w-4 h-4" />
							<Trans>Import</Trans>
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}
