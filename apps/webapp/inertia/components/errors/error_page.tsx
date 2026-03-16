import { Link } from '@adonisjs/inertia/react';

interface ErrorPageProps {
	title: React.ReactNode;
	message: React.ReactNode;
	statusCode?: number;
}

export const ErrorPage = ({
	title,
	message,
	statusCode,
}: Readonly<ErrorPageProps>) => (
	<div className="flex items-center justify-center min-h-[60vh] px-4">
		<div className="text-center max-w-md w-full">
			{statusCode && (
				<div className="text-6xl font-bold text-gray-300 dark:text-gray-700 mb-4">
					{statusCode}
				</div>
			)}
			<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
				{title}
			</h1>
			<p className="text-gray-600 dark:text-gray-400 mb-8">{message}</p>
			<Link
				route="home"
				className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
			>
				<span>Go to Home</span>
			</Link>
		</div>
	</div>
);
