import { BaseLayout } from '~/layouts/base_layout';
import { Footer } from '~/components/common/navigation/footer';
import { Navbar } from '~/components/common/navigation/navbar';

interface LandingLayoutProps {
	children: React.ReactNode;
}

export const LandingLayout = ({ children }: Readonly<LandingLayoutProps>) => (
	<BaseLayout>
		<div className="bg-paper dark:bg-paper-dark">
			<div className="max-w-[1100px] mx-auto p-4 flex flex-col md:p-6 gap-4">
				<Navbar />
				<div data-page-transition>{children}</div>
				<Footer />
			</div>
		</div>
	</BaseLayout>
);
