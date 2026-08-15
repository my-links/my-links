import { BaseLayout } from '~/layouts/base_layout';
import { Footer } from '~/components/common/navigation/footer';
import { Navbar } from '~/components/common/navigation/navbar';

interface PublicLayoutProps {
	children: React.ReactNode;
}

export const PublicLayout = ({ children }: Readonly<PublicLayoutProps>) => (
	<BaseLayout>
		<div className="h-screen overflow-hidden bg-paper dark:bg-paper-dark">
			<div className="h-full max-w-[1100px] w-full mx-auto p-4 flex flex-col md:p-6 gap-4">
				<Navbar />
				<div
					className="flex-1 min-h-0 flex flex-col overflow-y-auto scrollbar-gutter-stable"
					data-page-transition
				>
					{children}
				</div>
				<Footer />
			</div>
		</div>
	</BaseLayout>
);
