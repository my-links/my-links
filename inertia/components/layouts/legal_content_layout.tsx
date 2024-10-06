import styled from '@emotion/styled';
import { ReactNode } from 'react';
import ContentLayout from '~/components/layouts/content_layout';
import LegalFooter from '~/components/legal/legal_footer';

const LegalContentStyle = styled(ContentLayout)({
	main: {
		'h1, p': {
			marginTop: '0.5em',
		},
		h2: {
			marginTop: '1.5em',
		},
		h3: {
			marginTop: '1em',
		},
		ul: {
			marginLeft: '2em',
		},
	},
});

const LegalContentLayout = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => (
	<LegalContentStyle className={className}>
		{children}
		<LegalFooter />
	</LegalContentStyle>
);

export default LegalContentLayout;
