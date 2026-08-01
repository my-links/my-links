import { Trans } from '@lingui/react/macro';

import SmallContentLayout from '~/layouts/small_content';

function TermsPage() {
	const date = '19/11/2023';

	return (
		<div className="max-w-none">
			<div className="mb-12 pb-8 border-b border-rule dark:border-rule-dark">
				<h1 className="font-display text-4xl sm:text-5xl text-ink dark:text-ink-dark mb-4">
					<Trans>Terms and Conditions of Use for MyLinks</Trans>
				</h1>
				<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rule dark:border-rule-dark">
					<span className="text-sm font-medium text-ink/70 dark:text-ink-dark/70">
						<Trans>Last updated: {date}</Trans>
					</span>
				</div>
			</div>

			<div className="mb-12 p-6 bg-paper dark:bg-ink rounded-2xl border border-rule dark:border-rule-dark">
				<p className="text-lg leading-relaxed text-ink/80 dark:text-ink-dark/80">
					<Trans>
						Welcome to MyLinks, a free and open-source bookmark manager focused
						on privacy and self-hosting. By using this service, you agree to the
						terms and conditions of use outlined below. Please read them
						carefully.
					</Trans>
				</p>
			</div>

			<section className="mb-10">
				<div className="flex items-center gap-3 mb-6">
					<div className="w-10 h-10 rounded-lg bg-brand dark:bg-brand-dark flex items-center justify-center text-paper font-display">
						1
					</div>
					<h2 className="font-display text-3xl text-ink dark:text-ink-dark">
						<Trans>Acceptance of Terms</Trans>
					</h2>
				</div>
				<div className="ml-14">
					<p className="text-base leading-relaxed text-ink/70 dark:text-ink-dark/70 mb-6">
						<Trans>
							By accessing MyLinks and using our services, you agree to comply
							with these Terms and Conditions of Use.
						</Trans>
					</p>
				</div>
			</section>

			<section className="mb-10">
				<div className="flex items-center gap-3 mb-6">
					<div className="w-10 h-10 rounded-lg bg-brand dark:bg-brand-dark flex items-center justify-center text-paper font-display">
						2
					</div>
					<h2 className="font-display text-3xl text-ink dark:text-ink-dark">
						<Trans>Use of the Service</Trans>
					</h2>
				</div>
				<div className="ml-14 space-y-8">
					<div>
						<h3 className="text-xl font-semibold mb-3 text-ink dark:text-ink-dark">
							<Trans>2.1 User Account</Trans>
						</h3>
						<p className="text-base leading-relaxed text-ink/70 dark:text-ink-dark/70">
							<Trans>
								To access certain features of MyLinks, you will need to create a
								user account. You are responsible for the confidentiality of
								your account and credentials.
							</Trans>
						</p>
					</div>

					<div>
						<h3 className="text-xl font-semibold mb-3 text-ink dark:text-ink-dark">
							<Trans>2.2 Authorized Use</Trans>
						</h3>
						<p className="text-base leading-relaxed text-ink/70 dark:text-ink-dark/70">
							<Trans>
								You commit to using MyLinks in accordance with applicable laws
								and not violating the rights of third parties.
							</Trans>
						</p>
					</div>

					<div>
						<h3 className="text-xl font-semibold mb-3 text-ink dark:text-ink-dark">
							<Trans>2.3 User Content</Trans>
						</h3>
						<p className="text-base leading-relaxed text-ink/70 dark:text-ink-dark/70">
							<Trans>
								By posting content on MyLinks, you grant MyLinks a worldwide,
								non-exclusive, transferable, and free license to use, reproduce,
								distribute, and display this content.
							</Trans>
						</p>
					</div>
				</div>
			</section>

			<section className="mb-10">
				<div className="flex items-center gap-3 mb-6">
					<div className="w-10 h-10 rounded-lg bg-brand dark:bg-brand-dark flex items-center justify-center text-paper font-display">
						3
					</div>
					<h2 className="font-display text-3xl text-ink dark:text-ink-dark">
						<Trans>Personal Data</Trans>
					</h2>
				</div>
				<div className="ml-14 space-y-8">
					<div>
						<h3 className="text-xl font-semibold mb-3 text-ink dark:text-ink-dark">
							<Trans>3.1 Collection and Use</Trans>
						</h3>
						<p className="text-base leading-relaxed text-ink/70 dark:text-ink-dark/70">
							<Trans>
								The collection and use of personal data is governed by our
								Privacy Policy. Please refer to it for detailed information
								about how we collect, use, and protect your data.
							</Trans>
						</p>
					</div>

					<div>
						<h3 className="text-xl font-semibold mb-3 text-ink dark:text-ink-dark">
							<Trans>3.2 Account Deletion</Trans>
						</h3>
						<p className="text-base leading-relaxed text-ink/70 dark:text-ink-dark/70">
							<Trans>
								You can request the deletion of your account at any time in
								accordance with our Privacy Policy.
							</Trans>
						</p>
					</div>
				</div>
			</section>

			<section className="mb-10">
				<div className="flex items-center gap-3 mb-6">
					<div className="w-10 h-10 rounded-lg bg-brand dark:bg-brand-dark flex items-center justify-center text-paper font-display">
						4
					</div>
					<h2 className="font-display text-3xl text-ink dark:text-ink-dark">
						<Trans>Responsibilities and Warranties</Trans>
					</h2>
				</div>
				<div className="ml-14 space-y-8">
					<div>
						<h3 className="text-xl font-semibold mb-3 text-ink dark:text-ink-dark">
							<Trans>4.1 Responsibility</Trans>
						</h3>
						<p className="text-base leading-relaxed text-ink/70 dark:text-ink-dark/70">
							<Trans>
								MyLinks cannot be held responsible for direct or indirect
								damages arising from the use of our services.
							</Trans>
						</p>
					</div>

					<div>
						<h3 className="text-xl font-semibold mb-3 text-ink dark:text-ink-dark">
							<Trans>4.2 Warranties</Trans>
						</h3>
						<p className="text-base leading-relaxed text-ink/70 dark:text-ink-dark/70">
							<Trans>
								MyLinks does not guarantee that the service will be free from
								errors or interruptions.
							</Trans>
						</p>
					</div>
				</div>
			</section>

			<section className="mb-10">
				<div className="flex items-center gap-3 mb-6">
					<div className="w-10 h-10 rounded-lg bg-brand dark:bg-brand-dark flex items-center justify-center text-paper font-display">
						5
					</div>
					<h2 className="font-display text-3xl text-ink dark:text-ink-dark">
						<Trans>Changes to the Terms</Trans>
					</h2>
				</div>
				<div className="ml-14">
					<p className="text-base leading-relaxed text-ink/70 dark:text-ink-dark/70 mb-6">
						<Trans>
							MyLinks reserves the right to modify these Terms and Conditions of
							Use at any time. Users will be notified of changes through a
							notification on the site.
						</Trans>
					</p>
				</div>
			</section>

			<section className="mb-10">
				<div className="flex items-center gap-3 mb-6">
					<div className="w-10 h-10 rounded-lg bg-brand dark:bg-brand-dark flex items-center justify-center text-paper font-display">
						6
					</div>
					<h2 className="font-display text-3xl text-ink dark:text-ink-dark">
						<Trans>Termination</Trans>
					</h2>
				</div>
				<div className="ml-14">
					<p className="text-base leading-relaxed text-ink/70 dark:text-ink-dark/70 mb-6">
						<Trans>
							MyLinks reserves the right to terminate or suspend your access to
							the service, with or without notice, in case of violation of these
							Terms and Conditions of Use.
						</Trans>
					</p>
				</div>
			</section>
		</div>
	);
}

TermsPage.layout = (page: React.ReactNode) => (
	<SmallContentLayout>{page}</SmallContentLayout>
);
export default TermsPage;
