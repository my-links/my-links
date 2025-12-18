import { Trans } from '@lingui/react/macro';
import SmallContentLayout from '~/layouts/small_content';

function PrivacyPage() {
	const date = '19/11/2023';
	return (
		<div className="max-w-none">
			<h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
				<Trans>Privacy Policy of MyLinks</Trans>
			</h1>
			<p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
				<Trans>Last updated: {date}</Trans>
			</p>
			<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-8">
				<Trans>
					Welcome to MyLinks, a free and open-source bookmark manager focused on
					privacy and self-hosting. This privacy policy aims to inform you about
					how we collect, use, and protect your data.
				</Trans>
			</p>

			<h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-gray-100">
				<Trans>1. Data Collection</Trans>
			</h2>
			<h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
				<Trans>1.1 Cookies</Trans>
			</h3>
			<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
				<Trans>
					Cookies used on MyLinks are essential to ensure the proper functioning
					of the site. By continuing to use our service, you consent to the use
					of these cookies.
				</Trans>
			</p>

			<h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
				<Trans>1.2 User Data</Trans>
			</h3>
			<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
				<Trans>
					To create personalized collections and links and associate them with
					their author, we collect the following information:
				</Trans>
			</p>
			<ul className="list-disc list-inside space-y-2 mb-6 ml-4 text-gray-700 dark:text-gray-300">
				{['Google ID', 'Lastname', 'Firstname', 'Email', 'Avatar'].map(
					(field) => (
						<li key={field} className="text-base">
							<Trans>{field}</Trans>
						</li>
					)
				)}
			</ul>

			<h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-gray-100">
				<Trans>2. Data Use</Trans>
			</h2>
			<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
				<Trans>
					The collected data is neither resold nor used for purposes other than
					initially intended, namely the management of collections and links
					created by the user.
				</Trans>
			</p>

			<h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-gray-100">
				<Trans>3. Data Storage</Trans>
			</h2>
			<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
				<Trans>Data is stored securely to protect your privacy.</Trans>
			</p>

			<h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
				<Trans>3.1 Data Retention Period</Trans>
			</h3>
			<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
				<Trans>
					Functional data is retained until the user requests deletion. Once
					this request is made, the data will be permanently deleted.
				</Trans>
			</p>

			<h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-gray-100">
				<Trans>4. User Rights</Trans>
			</h2>
			<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
				<Trans>
					The user has the right to retrieve all their data at any time and/or
					request the complete deletion of their data.
				</Trans>
			</p>

			<h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-gray-100">
				<Trans>5. GDPR Compliance</Trans>
			</h2>
			<p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
				<Trans>
					MyLinks complies with the General Data Protection Regulation (GDPR) of
					the European Union.
				</Trans>
			</p>
		</div>
	);
}

PrivacyPage.layout = (page: React.ReactNode) => (
	<SmallContentLayout>{page}</SmallContentLayout>
);
export default PrivacyPage;
