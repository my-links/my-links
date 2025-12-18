import { Trans } from '@lingui/react/macro';
import SmallContentLayout from '~/layouts/small_content';

function TermsPage() {
	const date = '19/11/2023';

	return (
		<div className="max-w-none">
			<h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
				<Trans>Terms and Conditions of Use for MyLinks</Trans>
			</h1>
			<p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
				<Trans>Last updated: {date}</Trans>
			</p>
			<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-8">
				<Trans>
					Welcome to MyLinks, a free and open-source bookmark manager focused on
					privacy and self-hosting. By using this service, you agree to the
					terms and conditions of use outlined below. Please read them
					carefully.
				</Trans>
			</p>

			<h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-gray-100">
				<Trans>1. Acceptance of Terms</Trans>
			</h2>
			<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
				<Trans>
					By accessing MyLinks and using our services, you agree to comply with
					these Terms and Conditions of Use.
				</Trans>
			</p>

			<h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-gray-100">
				<Trans>2. Use of the Service</Trans>
			</h2>
			<h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
				<Trans>2.1 User Account</Trans>
			</h3>
			<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
				<Trans>
					To access certain features of MyLinks, you will need to create a user
					account. You are responsible for the confidentiality of your account
					and credentials.
				</Trans>
			</p>

			<h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
				<Trans>2.2 Authorized Use</Trans>
			</h3>
			<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
				<Trans>
					You commit to using MyLinks in accordance with applicable laws and not
					violating the rights of third parties.
				</Trans>
			</p>

			<h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
				<Trans>2.3 User Content</Trans>
			</h3>
			<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
				<Trans>
					By posting content on MyLinks, you grant MyLinks a worldwide,
					non-exclusive, transferable, and free license to use, reproduce,
					distribute, and display this content.
				</Trans>
			</p>

			<h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-gray-100">
				<Trans>3. Personal Data</Trans>
			</h2>
			<h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
				<Trans>3.1 Collection and Use</Trans>
			</h3>
			<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
				<Trans>
					The collection and use of personal data is governed by our Privacy
					Policy. Please refer to it for detailed information about how we
					collect, use, and protect your data.
				</Trans>
			</p>

			<h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
				<Trans>3.2 Account Deletion</Trans>
			</h3>
			<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
				<Trans>
					You can request the deletion of your account at any time in accordance
					with our Privacy Policy.
				</Trans>
			</p>

			<h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-gray-100">
				<Trans>4. Responsibilities and Warranties</Trans>
			</h2>
			<h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
				<Trans>4.1 Responsibility</Trans>
			</h3>
			<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
				<Trans>
					MyLinks cannot be held responsible for direct or indirect damages
					arising from the use of our services.
				</Trans>
			</p>

			<h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
				<Trans>4.2 Warranties</Trans>
			</h3>
			<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
				<Trans>
					MyLinks does not guarantee that the service will be free from errors
					or interruptions.
				</Trans>
			</p>

			<h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-gray-100">
				<Trans>5. Changes to the Terms</Trans>
			</h2>
			<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
				<Trans>
					MyLinks reserves the right to modify these Terms and Conditions of Use
					at any time. Users will be notified of changes through a notification
					on the site.
				</Trans>
			</p>

			<h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-gray-100">
				<Trans>6. Termination</Trans>
			</h2>
			<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
				<Trans>
					MyLinks reserves the right to terminate or suspend your access to the
					service, with or without notice, in case of violation of these Terms
					and Conditions of Use.
				</Trans>
			</p>
		</div>
	);
}

TermsPage.layout = (page: React.ReactNode) => (
	<SmallContentLayout>{page}</SmallContentLayout>
);
export default TermsPage;
