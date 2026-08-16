import { t } from '@lingui/core/macro';
import { Button } from '@minimalstuff/ui';
import { Trans } from '@lingui/react/macro';
import { Head, useForm } from '@inertiajs/react';

import { urlFor } from '~/lib/tuyau';
import { InertiaProps } from '~/lib/inertia_props';

type PageProps = InertiaProps<{
	email: string;
}>;

function ReactivateAccountPage({ email }: Readonly<PageProps>) {
	const { processing: confirming, post: postConfirm } = useForm({});
	const { processing: declining, post: postDecline } = useForm({});

	const handleConfirm = () => postConfirm(urlFor('auth.reactivate.submit'));
	const handleDecline = () => postDecline(urlFor('auth.reactivate.decline'));

	return (
		<>
			<Head title={t`Account pending deletion`} />
			<div className="max-w-md w-full mx-auto my-auto bg-paper dark:bg-ink border border-rule dark:border-rule-dark rounded-2xl p-8 shadow-sm">
				<h1 className="font-display text-2xl text-ink dark:text-ink-dark mb-1">
					<Trans>This account is scheduled for deletion</Trans>
				</h1>
				<p className="text-sm text-ink/60 dark:text-ink-dark/60 mb-6">
					<Trans>
						{email} was disabled after a deletion request and hasn't been
						permanently deleted yet. Log in anyway to cancel the deletion and
						restore the account?
					</Trans>
				</p>

				<div className="space-y-3">
					<Button
						type="button"
						onClick={handleConfirm}
						disabled={confirming || declining}
						loading={confirming}
						fullWidth
					>
						<Trans>Log in and cancel deletion</Trans>
					</Button>

					<Button
						type="button"
						color="neutral"
						onClick={handleDecline}
						disabled={confirming || declining}
						loading={declining}
						fullWidth
					>
						<Trans>No, keep it scheduled for deletion</Trans>
					</Button>
				</div>
			</div>
		</>
	);
}

export default ReactivateAccountPage;
