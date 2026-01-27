import { router, useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Button } from '~/components/common/button';
import { useModalStore } from '~/stores/modal_store';
import { useRouteHelper } from '~/lib/route_helper';

export function DeleteAccount() {
	const { url } = useRouteHelper();
	const { processing } = useForm({});

	const handleDeleteAccount = () => {
		useModalStore.getState().openConfirm({
			title: <Trans>Delete Account</Trans>,
			children: (
				<Trans>
					Are you sure you want to delete your account? This action cannot be
					undone. All your collections, links, and data will be permanently
					deleted.
				</Trans>
			),
			confirmLabel: <Trans>Delete Account</Trans>,
			cancelLabel: <Trans>Cancel</Trans>,
			confirmColor: 'red',
			onConfirm: async () => {
				const deleteUrl = url('user.settings.delete');
				router.delete(deleteUrl);
			},
		});
	};

	return (
		<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
			<div className="mb-4">
				<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
					<Trans>Delete Account</Trans>
				</h2>
				<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
					<Trans>
						Once you delete your account, there is no going back. Please be
						certain.
					</Trans>
				</p>
			</div>

			<Button
				variant="danger"
				size="sm"
				onClick={handleDeleteAccount}
				disabled={processing}
			>
				<Trans>Delete Account</Trans>
			</Button>
		</div>
	);
}
