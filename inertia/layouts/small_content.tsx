import { PropsWithChildren } from 'react';
import { Footer } from '~/components/common/footer';
import { Navbar } from '~/components/common/navbar';
import { BaseLayout } from './base_layout';

const SmallContentLayout = ({ children }: PropsWithChildren) => (
	<BaseLayout>
		<div className="bg-gray-50 dark:bg-gray-900 h-screen overflow-hidden">
			<div className="h-full max-w-[1500px] mx-auto p-4 flex flex-col gap-6">
				<Navbar />
				<div className="flex-1 min-h-0 flex flex-col">
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
