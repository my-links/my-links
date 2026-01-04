import { Trans } from '@lingui/react/macro';
import { Link } from '@tuyau/inertia/react';

const featureList = [
	'collection',
	'link',
	'search',
	'extension',
	'share',
	'contribute',
] as const;

type FeatureName = (typeof featureList)[number];

function getIconClass(name: FeatureName): string {
	switch (name) {
		case 'collection':
			return 'i-ant-design-folder-open-filled';
		case 'link':
			return 'i-ion-link';
		case 'search':
			return 'i-ion-search';
		case 'extension':
			return 'i-ion-extension-puzzle-outline';
		case 'share':
			return 'i-ion-share';
		case 'contribute':
			return 'i-fa6-solid-user';
	}
}

function getFeatureTitle(name: FeatureName) {
	switch (name) {
		case 'collection':
			return <Trans>Collections</Trans>;
		case 'link':
			return <Trans>Links</Trans>;
		case 'search':
			return <Trans>Search</Trans>;
		case 'extension':
			return <Trans>Extension</Trans>;
		case 'share':
			return <Trans>Share</Trans>;
		case 'contribute':
			return <Trans>Contribute</Trans>;
	}
}

function getFeatureText(name: FeatureName) {
	switch (name) {
		case 'collection':
			return <Trans>Organize your links into collections</Trans>;
		case 'link':
			return <Trans>Save and manage your favorite links</Trans>;
		case 'search':
			return <Trans>Quickly find what you're looking for</Trans>;
		case 'extension':
			return <Trans>Use our browser extension for quick access</Trans>;
		case 'share':
			return <Trans>Share your collections with others</Trans>;
		case 'contribute':
			return <Trans>Help improve the project by contributing</Trans>;
	}
}

const Feature = ({ name: featureName }: { name: FeatureName }) => (
	<div className="group relative bg-white dark:bg-gray-800/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
		<div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
		<div className="relative">
			<div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/20">
				<div
					className={getIconClass(featureName)}
					style={{ width: '24px', height: '24px', color: 'white' }}
				/>
			</div>
			<h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
				{getFeatureTitle(featureName)}
			</h3>
			<p className="text-gray-600 dark:text-gray-400 leading-relaxed">
				{getFeatureText(featureName)}
			</p>
		</div>
	</div>
);

const values = [
	{
		icon: 'i-mdi-code-braces',
		title: <Trans>Open Source</Trans>,
		description: (
			<Trans>
				Built with transparency and community in mind. View the source code,
				contribute, and trust in our open development process.
			</Trans>
		),
		color: 'from-purple-500 to-purple-600',
	},
	{
		icon: 'i-mdi-shield-lock',
		title: <Trans>Privacy First</Trans>,
		description: (
			<Trans>
				Your data belongs to you. We prioritize your privacy and never share or
				sell your information to third parties.
			</Trans>
		),
		color: 'from-green-500 to-green-600',
	},
	{
		icon: 'i-mdi-server',
		title: <Trans>Self-Hosted</Trans>,
		description: (
			<Trans>
				Take full control by hosting MyLinks on your own infrastructure. Your
				data, your rules, your server.
			</Trans>
		),
		color: 'from-blue-500 to-blue-600',
	},
];

const HomePage = () => (
	<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28">
		<div className="text-center mb-16">
			<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent">
				<Trans>Manage your links in the best possible way</Trans>
			</h1>
			<p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
				<Trans>
					An open-source, self-hosted bookmark manager that lets you manage your
					favorite links in an intuitive interface
				</Trans>
			</p>
			<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
				<Link
					route="auth"
					className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
				>
					<Trans>Get Started</Trans>
				</Link>
				<Link
					route="auth"
					className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 hover:shadow-lg"
				>
					<Trans>Sign Up</Trans>
				</Link>
			</div>
		</div>

		<div className="mb-24">
			<div className="text-center mb-12">
				<h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
					<Trans>Why Choose MyLinks?</Trans>
				</h2>
				<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
					<Trans>
						Built for users who value privacy, control, and simplicity
					</Trans>
				</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				{values.map((value, index) => (
					<div
						key={index}
						className="bg-white dark:bg-gray-800/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300"
					>
						<div
							className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6 shadow-lg`}
						>
							<div
								className={value.icon}
								style={{ width: '32px', height: '32px', color: 'white' }}
							/>
						</div>
						<h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
							{value.title}
						</h3>
						<p className="text-gray-600 dark:text-gray-400 leading-relaxed">
							{value.description}
						</p>
					</div>
				))}
			</div>
		</div>

		<div className="mb-24">
			<div className="text-center mb-12">
				<h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
					<Trans>Powerful Features</Trans>
				</h2>
				<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
					<Trans>
						Everything you need to organize and manage your bookmarks
						effectively
					</Trans>
				</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
				{featureList.map((feature, index) => (
					<Feature name={feature} key={index} />
				))}
			</div>
		</div>

		<div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-3xl p-12 text-center overflow-hidden">
			<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
			<div className="relative z-10">
				<h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
					<Trans>Ready to Get Started?</Trans>
				</h2>
				<p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
					<Trans>
						Join the community and start organizing your links today. It's free,
						open-source, and respects your privacy.
					</Trans>
				</p>
				<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
					<Link
						route="auth"
						className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
					>
						<Trans>Create Account</Trans>
					</Link>
					<Link
						route="auth"
						className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
					>
						<Trans>Sign In</Trans>
					</Link>
				</div>
			</div>
		</div>
	</div>
);

export default HomePage;
