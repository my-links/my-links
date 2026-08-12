import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Head, useForm } from '@inertiajs/react';
import { Button, Input } from '@minimalstuff/ui';

import { urlFor } from '~/lib/tuyau';
import { InertiaProps } from '~/lib/inertia_props';
import SmallContentLayout from '~/layouts/small_content';

type SudoFormData = {
	password: string;
};

type PageProps = InertiaProps<{
	hasPassword: boolean;
	isGoogleConfirmationAvailable: boolean;
}>;

function SudoPage({ hasPassword, isGoogleConfirmationAvailable }: PageProps) {
	const { data, setData, submit, processing, errors } = useForm<SudoFormData>({
		password: '',
	});

	const isSubmitDisabled = processing || !data.password;

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		submit('post', urlFor('auth.sudo.submit'));
	};

	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) =>
		setData('password', event.target.value);

	return (
		<>
			<Head title={t`Confirm your identity`} />
			<div className="max-w-md mx-auto bg-paper dark:bg-ink border border-rule dark:border-rule-dark rounded-2xl p-8 shadow-sm">
				<h1 className="font-display text-2xl text-ink dark:text-ink-dark mb-1">
					<Trans>Confirm your identity</Trans>
				</h1>
				<p className="text-sm text-ink/60 dark:text-ink-dark/60 mb-6">
					<Trans>
						You are about to change something that protects your account, so we
						ask once more who you are.
					</Trans>
				</p>

				{hasPassword && (
					<form onSubmit={handleSubmit} className="space-y-4">
						<Input
							label={t`Current password`}
							type="password"
							id="password"
							name="password"
							value={data.password}
							onChange={handlePasswordChange}
							placeholder={t`Your password`}
							error={errors.password}
							autoComplete="current-password"
							autoFocus
							required
						/>

						<Button
							type="submit"
							disabled={isSubmitDisabled}
							loading={processing}
							fullWidth
						>
							<Trans>Confirm</Trans>
						</Button>
					</form>
				)}

				{isGoogleConfirmationAvailable && (
					<div className="mt-6 space-y-4">
						{hasPassword && (
							<div className="flex items-center gap-3">
								<span className="h-px flex-1 bg-rule dark:bg-rule-dark" />
								<span className="text-xs uppercase tracking-wide text-ink/50 dark:text-ink-dark/50">
									<Trans>or</Trans>
								</span>
								<span className="h-px flex-1 bg-rule dark:bg-rule-dark" />
							</div>
						)}
						{/* A plain anchor, not an Inertia link: this leaves the app for
						    Google, and an XHR navigation cannot do that. */}
						<a
							href={urlFor('auth.sudo.google')}
							className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-rule dark:border-rule-dark text-ink dark:text-ink-dark font-medium hover:border-brand dark:hover:border-brand-dark transition-colors duration-200"
						>
							<i
								className="i-logos-google-icon h-5 w-5 block"
								aria-hidden="true"
							/>
							<Trans>Confirm with Google</Trans>
						</a>
					</div>
				)}

				{!hasPassword && !isGoogleConfirmationAvailable && (
					<p className="text-sm text-ink/60 dark:text-ink-dark/60">
						<Trans>
							This account has no way left to confirm its identity on this
							instance. Sign out and sign in again to continue.
						</Trans>
					</p>
				)}
			</div>
		</>
	);
}

SudoPage.layout = (page: React.ReactNode) => (
	<SmallContentLayout>{page}</SmallContentLayout>
);

export default SudoPage;
