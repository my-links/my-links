import { BaseLayout } from './base_layout';
import { Footer } from '~/components/common/navigation/footer';
import { Navbar } from '~/components/common/navigation/navbar';

interface SmallContentLayoutProps {
	children: React.ReactNode;
}

const SmallContentLayout = ({
	children,
}: Readonly<SmallContentLayoutProps>) => (
	<BaseLayout>
		<div className="bg-paper dark:bg-paper-dark h-screen overflow-hidden">
			<div className="h-full max-w-[1500px] mx-auto p-4 flex flex-col gap-6 overflow-x-hidden">
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
