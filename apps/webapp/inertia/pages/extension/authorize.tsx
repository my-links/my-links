import { t } from '@lingui/core/macro';
import { Button } from '@minimalstuff/ui';
import { Trans } from '@lingui/react/macro';
import { Head, useForm } from '@inertiajs/react';

import { urlFor } from '~/lib/tuyau';
import { InertiaProps } from '~/lib/inertia_props';

type PageProps = InertiaProps<{
	redirectUri: string;
	browser: 'chromium' | 'firefox';
	cancelUrl: string;
}>;

function ExtensionBrowserLabel({ browser }: Readonly<{ browser: string }>) {
	if (browser === 'firefox') return <Trans>Firefox</Trans>;
	return <Trans>Chrome or another Chromium browser</Trans>;
}

function AuthorizeExtensionPage({
	redirectUri,
	browser,
	cancelUrl,
}: Readonly<PageProps>) {
	const { post, processing } = useForm({ redirect_uri: redirectUri });

	const handleAuthorize = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		post(urlFor('extension.authorize.submit'));
	};

	return (
		<>
			<Head title={t`Connect the browser extension`} />
			<div className="max-w-md w-full mx-auto my-auto bg-paper dark:bg-ink border border-rule dark:border-rule-dark rounded-2xl p-8 shadow-sm">
				<h1 className="font-display text-2xl text-ink dark:text-ink-dark mb-1">
					<Trans>
						Allow the MyLinks browser extension to access your account?
					</Trans>
				</h1>
				<p className="text-sm text-ink/60 dark:text-ink-dark/60 mb-6">
					<Trans>
						The extension for{' '}
						<strong>
							<ExtensionBrowserLabel browser={browser} />
						</strong>{' '}
						asks for full access to your links and collections. Only continue if
						you started this from the extension yourself.
					</Trans>
				</p>

				<form onSubmit={handleAuthorize} className="space-y-3">
					<Button
						type="submit"
						disabled={processing}
						loading={processing}
						fullWidth
					>
						<Trans>Authorize</Trans>
					</Button>
					{/* A plain anchor, not an Inertia link: this leaves the app for the extension callback. */}
					<a
						href={cancelUrl}
						className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg border border-rule dark:border-rule-dark text-ink dark:text-ink-dark font-medium hover:border-brand dark:hover:border-brand-dark transition-colors duration-200"
					>
						<Trans>Cancel</Trans>
					</a>
				</form>
			</div>
		</>
	);
}

export default AuthorizeExtensionPage;
