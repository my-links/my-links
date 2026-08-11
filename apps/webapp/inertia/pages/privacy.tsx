import { Trans } from '@lingui/react/macro';

import SmallContentLayout from '~/layouts/small_content';

const date = '11/08/2026';

const PrivacyPage = () => (
	<div className="max-w-none">
		<div className="mb-12 pb-8 border-b border-rule dark:border-rule-dark">
			<h1 className="font-display text-4xl sm:text-5xl text-ink dark:text-ink-dark mb-4">
				<Trans>Privacy Policy of MyLinks</Trans>
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
					Welcome to MyLinks, a free and open-source bookmark manager focused on
					privacy and self-hosting. This privacy policy aims to inform you about
					how we collect, use, and protect your data.
				</Trans>
			</p>
		</div>

		<section className="mb-10">
			<div className="flex items-center gap-3 mb-6">
				<div className="w-10 h-10 rounded-lg bg-brand dark:bg-brand-dark flex items-center justify-center text-paper font-display">
					1
				</div>
				<h2 className="font-display text-3xl text-ink dark:text-ink-dark">
					<Trans>Data Collection</Trans>
				</h2>
			</div>
			<div className="ml-14 space-y-8">
				<div>
					<h3 className="text-xl font-semibold mb-3 text-ink dark:text-ink-dark">
						<Trans>1.1 Cookies</Trans>
					</h3>
					<p className="text-base leading-relaxed text-ink/70 dark:text-ink-dark/70">
						<Trans>
							Cookies used on MyLinks are essential to ensure the proper
							functioning of the site. By continuing to use our service, you
							consent to the use of these cookies.
						</Trans>
					</p>
				</div>

				<div>
					<h3 className="text-xl font-semibold mb-3 text-ink dark:text-ink-dark">
						<Trans>1.2 User Data</Trans>
					</h3>
					<p className="text-base leading-relaxed text-ink/70 dark:text-ink-dark/70 mb-4">
						<Trans>
							To create personalized collections and links and associate them
							with their author, we collect the following information:
						</Trans>
					</p>
					<div className="bg-paper dark:bg-ink rounded-xl p-6 border border-rule dark:border-rule-dark">
						<ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{['Google ID', 'Lastname', 'Firstname', 'Email'].map((field) => (
								<li
									key={field}
									className="flex items-center gap-2 text-base text-ink/70 dark:text-ink-dark/70"
								>
									<div className="w-1.5 h-1.5 rounded-full bg-brand dark:bg-brand-dark" />
									<Trans>{field}</Trans>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</section>

		<section className="mb-10">
			<div className="flex items-center gap-3 mb-6">
				<div className="w-10 h-10 rounded-lg bg-brand dark:bg-brand-dark flex items-center justify-center text-paper font-display">
					2
				</div>
				<h2 className="font-display text-3xl text-ink dark:text-ink-dark">
					<Trans>Data Use</Trans>
				</h2>
			</div>
			<div className="ml-14">
				<div className="bg-paper dark:bg-ink rounded-xl p-6 border border-rule dark:border-rule-dark">
					<p className="text-base leading-relaxed text-ink/70 dark:text-ink-dark/70">
						<Trans>
							The collected data is neither resold nor used for purposes other
							than initially intended, namely the management of collections and
							links created by the user.
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
					<Trans>Data Storage</Trans>
				</h2>
			</div>
			<div className="ml-14 space-y-8">
				<p className="text-base leading-relaxed text-ink/70 dark:text-ink-dark/70">
					<Trans>Data is stored securely to protect your privacy.</Trans>
				</p>

				<div>
					<h3 className="text-xl font-semibold mb-3 text-ink dark:text-ink-dark">
						<Trans>3.1 Data Retention Period</Trans>
					</h3>
					<p className="text-base leading-relaxed text-ink/70 dark:text-ink-dark/70">
						<Trans>
							Functional data is retained until the user requests deletion. Once
							this request is made, the data will be permanently deleted.
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
					<Trans>User Rights</Trans>
				</h2>
			</div>
			<div className="ml-14">
				<div className="bg-paper dark:bg-ink rounded-xl p-6 border border-rule dark:border-rule-dark">
					<p className="text-base leading-relaxed text-ink/70 dark:text-ink-dark/70">
						<Trans>
							The user has the right to retrieve all their data at any time
							and/or request the complete deletion of their data.
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
					<Trans>GDPR Compliance</Trans>
				</h2>
			</div>
			<div className="ml-14">
				<div className="bg-paper dark:bg-ink rounded-xl p-6 border border-brand dark:border-brand-dark">
					<p className="text-base leading-relaxed text-ink/80 dark:text-ink-dark/80 font-medium">
						<Trans>
							MyLinks complies with the General Data Protection Regulation
							(GDPR) of the European Union.
						</Trans>
					</p>
				</div>
			</div>
		</section>
	</div>
);

PrivacyPage.layout = (page: React.ReactNode) => (
	<SmallContentLayout>{page}</SmallContentLayout>
);
export default PrivacyPage;
