import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';

interface CreateTokenModalProps {
	onCreate: (name: string) => Promise<void>;
	onClose: () => void;
}

export function CreateTokenModal({ onCreate, onClose }: CreateTokenModalProps) {
	const { t } = useLingui();
	const [tokenName, setTokenName] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleCreate = async () => {
		if (!tokenName.trim()) return;

		setIsLoading(true);
		try {
			await onCreate(tokenName);
			onClose();
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			<p className="text-sm text-gray-600 dark:text-gray-300">
				<Trans>Create a new API token to access the API</Trans>
			</p>
			<div className="space-y-2">
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
					<Trans>Token name</Trans>
					<span className="text-red-500 ml-1">*</span>
				</label>
				<input
					type="text"
					placeholder={t({ message: 'Enter token name' })}
					value={tokenName}
					onChange={(e) => setTokenName(e.target.value)}
					className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					required
				/>
			</div>
			<div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
				<button
					type="button"
					onClick={onClose}
					className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
				>
					<Trans>Cancel</Trans>
				</button>
				<button
					type="button"
					onClick={handleCreate}
					disabled={!tokenName.trim() || isLoading}
					className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
						!tokenName.trim() || isLoading
							? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
							: 'bg-blue-600 hover:bg-blue-700'
					}`}
				>
					{isLoading ? (
						<span className="flex items-center gap-2">
							<span className="i-svg-spinners-3-dots-fade w-4 h-4" />
							<Trans>Create token</Trans>
						</span>
					) : (
						<Trans>Create token</Trans>
					)}
				</button>
			</div>
		</div>
	);
}
