import { Footer } from '~/components/common/navigation/footer';
import { Navbar } from '~/components/common/navigation/navbar';
import { BaseLayout } from './base_layout';

interface SmallContentLayoutProps {
	children: React.ReactNode;
}

const SmallContentLayout = ({
	children,
}: Readonly<SmallContentLayoutProps>) => (
	<BaseLayout>
		<div className="relative bg-gray-50 dark:bg-gray-900 h-screen overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-transparent to-transparent dark:from-blue-950/20 pointer-events-none" />
			<div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
			<div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
			<div className="relative h-full max-w-[1500px] mx-auto p-4 flex flex-col gap-6 overflow-x-hidden">
				<Navbar />
				<div className="flex-1 min-h-0 flex flex-col overflow-y-auto overflow-x-hidden">
					<div
						className="w-full max-w-[800px] mx-auto my-8"
						data-page-transition
					>
						{children}
					</div>
				</div>
				<Footer />
			</div>
		</div>
	</BaseLayout>
);

export default SmallContentLayout;
