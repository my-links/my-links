import { Trans } from '@lingui/react/macro';
import SmallContentLayout from '~/layouts/small_content';

function PrivacyPage() {
	const date = '19/11/2023';
	return (
		<div className="max-w-none">
			<div className="mb-12 pb-8 border-b border-gray-200 dark:border-gray-700">
				<h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
					<Trans>Privacy Policy of MyLinks</Trans>
				</h1>
				<div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full">
					<span className="text-sm font-medium text-green-700 dark:text-green-300">
						<Trans>Last updated: {date}</Trans>
					</span>
				</div>
			</div>

			<div className="mb-12 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl border border-green-100 dark:border-green-900/50">
				<p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
					<Trans>
						Welcome to MyLinks, a free and open-source bookmark manager focused
						on privacy and self-hosting. This privacy policy aims to inform you
						about how we collect, use, and protect your data.
					</Trans>
				</p>
			</div>

			<section className="mb-10">
				<div className="flex items-center gap-3 mb-6">
					<div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold">
						1
					</div>
					<h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
						<Trans>Data Collection</Trans>
					</h2>
				</div>
				<div className="ml-14 space-y-8">
					<div>
						<h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
							<Trans>1.1 Cookies</Trans>
						</h3>
						<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
							<Trans>
								Cookies used on MyLinks are essential to ensure the proper
								functioning of the site. By continuing to use our service, you
								consent to the use of these cookies.
							</Trans>
						</p>
					</div>

					<div>
						<h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
							<Trans>1.2 User Data</Trans>
						</h3>
						<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
							<Trans>
								To create personalized collections and links and associate them
								with their author, we collect the following information:
							</Trans>
						</p>
						<div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
							<ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{['Google ID', 'Lastname', 'Firstname', 'Email', 'Avatar'].map(
									(field) => (
										<li
											key={field}
											className="flex items-center gap-2 text-base text-gray-700 dark:text-gray-300"
										>
											<div className="w-1.5 h-1.5 rounded-full bg-green-500" />
											<Trans>{field}</Trans>
										</li>
									)
								)}
							</ul>
						</div>
					</div>
				</div>
			</section>

			<section className="mb-10">
				<div className="flex items-center gap-3 mb-6">
					<div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold">
						2
					</div>
					<h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
						<Trans>Data Use</Trans>
					</h2>
				</div>
				<div className="ml-14">
					<div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-6 border border-blue-100 dark:border-blue-900/50">
						<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
							<Trans>
								The collected data is neither resold nor used for purposes other
								than initially intended, namely the management of collections
								and links created by the user.
							</Trans>
						</p>
					</div>
				</div>
			</section>

			<section className="mb-10">
				<div className="flex items-center gap-3 mb-6">
					<div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold">
						3
					</div>
					<h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
						<Trans>Data Storage</Trans>
					</h2>
				</div>
				<div className="ml-14 space-y-8">
					<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
						<Trans>Data is stored securely to protect your privacy.</Trans>
					</p>

					<div>
						<h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
							<Trans>3.1 Data Retention Period</Trans>
						</h3>
						<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
							<Trans>
								Functional data is retained until the user requests deletion.
								Once this request is made, the data will be permanently deleted.
							</Trans>
						</p>
					</div>
				</div>
			</section>

			<section className="mb-10">
				<div className="flex items-center gap-3 mb-6">
					<div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold">
						4
					</div>
					<h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
						<Trans>User Rights</Trans>
					</h2>
				</div>
				<div className="ml-14">
					<div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-6 border border-purple-100 dark:border-purple-900/50">
						<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
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
					<div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold">
						5
					</div>
					<h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
						<Trans>GDPR Compliance</Trans>
					</h2>
				</div>
				<div className="ml-14">
					<div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-6 border border-green-200 dark:border-green-900/50">
						<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 font-medium">
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
}

PrivacyPage.layout = (page: React.ReactNode) => (
	<SmallContentLayout>{page}</SmallContentLayout>
);
export default PrivacyPage;
