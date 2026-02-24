import { Trans } from '@lingui/react/macro';
import SmallContentLayout from '~/layouts/small_content';

function TermsPage() {
	const date = '19/11/2023';

	return (
		<div className="max-w-none">
			<div className="mb-12 pb-8 border-b border-gray-200 dark:border-gray-700">
				<h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
					<Trans>Terms and Conditions of Use for MyLinks</Trans>
				</h1>
				<div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
					<span className="text-sm font-medium text-blue-700 dark:text-blue-300">
						<Trans>Last updated: {date}</Trans>
					</span>
				</div>
			</div>

			<div className="mb-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/50">
				<p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
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
					<div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">
						1
					</div>
					<h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
						<Trans>Acceptance of Terms</Trans>
					</h2>
				</div>
				<div className="ml-14">
					<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
						<Trans>
							By accessing MyLinks and using our services, you agree to comply
							with these Terms and Conditions of Use.
						</Trans>
					</p>
				</div>
			</section>

			<section className="mb-10">
				<div className="flex items-center gap-3 mb-6">
					<div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">
						2
					</div>
					<h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
						<Trans>Use of the Service</Trans>
					</h2>
				</div>
				<div className="ml-14 space-y-8">
					<div>
						<h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
							<Trans>2.1 User Account</Trans>
						</h3>
						<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
							<Trans>
								To access certain features of MyLinks, you will need to create a
								user account. You are responsible for the confidentiality of
								your account and credentials.
							</Trans>
						</p>
					</div>

					<div>
						<h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
							<Trans>2.2 Authorized Use</Trans>
						</h3>
						<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
							<Trans>
								You commit to using MyLinks in accordance with applicable laws
								and not violating the rights of third parties.
							</Trans>
						</p>
					</div>

					<div>
						<h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
							<Trans>2.3 User Content</Trans>
						</h3>
						<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
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
					<div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">
						3
					</div>
					<h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
						<Trans>Personal Data</Trans>
					</h2>
				</div>
				<div className="ml-14 space-y-8">
					<div>
						<h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
							<Trans>3.1 Collection and Use</Trans>
						</h3>
						<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
							<Trans>
								The collection and use of personal data is governed by our
								Privacy Policy. Please refer to it for detailed information
								about how we collect, use, and protect your data.
							</Trans>
						</p>
					</div>

					<div>
						<h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
							<Trans>3.2 Account Deletion</Trans>
						</h3>
						<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
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
					<div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">
						4
					</div>
					<h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
						<Trans>Responsibilities and Warranties</Trans>
					</h2>
				</div>
				<div className="ml-14 space-y-8">
					<div>
						<h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
							<Trans>4.1 Responsibility</Trans>
						</h3>
						<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
							<Trans>
								MyLinks cannot be held responsible for direct or indirect
								damages arising from the use of our services.
							</Trans>
						</p>
					</div>

					<div>
						<h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
							<Trans>4.2 Warranties</Trans>
						</h3>
						<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
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
					<div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">
						5
					</div>
					<h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
						<Trans>Changes to the Terms</Trans>
					</h2>
				</div>
				<div className="ml-14">
					<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
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
					<div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">
						6
					</div>
					<h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
						<Trans>Termination</Trans>
					</h2>
				</div>
				<div className="ml-14">
					<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
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
