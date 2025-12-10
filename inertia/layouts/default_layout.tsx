import { Footer } from '~/components/common/footer';
import { Navbar } from '~/components/common/navbar';
import { BaseLayout } from '~/layouts/base_layout';

export const DefaultLayout = ({ children }: React.PropsWithChildren) => (
	<BaseLayout>
		<div className="bg-gray-50 dark:bg-gray-900 h-screen overflow-hidden">
			<div className="h-full max-w-[1920px] mx-auto p-4 flex flex-col gap-6">
				<Navbar />
				<div className="flex-1 min-h-0 flex flex-col" data-page-transition>
					{children}
				</div>
				<Footer />
			</div>
		</div>
	</BaseLayout>
);
