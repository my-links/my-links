import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Button } from '~/components/common/button';
import { FormField } from '~/components/common/form_field';
import { Input } from '~/components/common/input';

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
			<FormField
				label={<Trans>Token name</Trans>}
				htmlFor="token-name"
				required
			>
				<Input
					id="token-name"
					type="text"
					placeholder={t({ message: 'Enter token name' })}
					value={tokenName}
					onChange={(e) => setTokenName(e.target.value)}
					required
				/>
			</FormField>
			<div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
				<Button variant="secondary" type="button" onClick={onClose}>
					<Trans>Cancel</Trans>
				</Button>
				<Button
					type="button"
					onClick={handleCreate}
					loading={isLoading}
					disabled={!tokenName.trim() || isLoading}
				>
					<Trans>Create token</Trans>
				</Button>
			</div>
		</div>
	);
}
