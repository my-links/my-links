import { BaseLayout } from '~/layouts/base_layout';

interface AppLayoutProps {
	children: React.ReactNode;
}

/**
 * Shell for the dashboard, settings and admin pages: no navbar, no footer.
 * The dashboard supplies its own navigation via the sidebar; every other page
 * gets one from `AppPageHeader` instead.
 */
export const AppLayout = ({ children }: Readonly<AppLayoutProps>) => (
	<BaseLayout>
		<div className="relative bg-gray-50 dark:bg-gray-900 h-screen overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-transparent to-transparent dark:from-blue-950/20 pointer-events-none" />
			<div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
			<div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
			<div className="relative h-full max-w-[2560px] mx-auto md:p-0 p-4 flex flex-col overflow-x-hidden">
				<div
					className="flex-1 min-h-0 flex flex-col overflow-y-auto overflow-x-hidden"
					data-page-transition
				>
					{children}
				</div>
			</div>
		</div>
	</BaseLayout>
);
