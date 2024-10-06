import styled from '@emotion/styled';
import TransitionLayout from '~/components/layouts/_transition_layout';

const ModalContainer = styled(TransitionLayout)(({ theme }) => ({
	minWidth: '500px',
	background: theme.colors.background,
	padding: '1em',
	borderRadius: theme.border.radius,
	marginTop: '6em',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	flexDirection: 'column',
	boxShadow: theme.colors.boxShadow,

	[`@media (max-width: ${theme.media.mobile})`]: {
		maxHeight: 'calc(100% - 2em)',
		width: 'calc(100% - 2em)',
		minWidth: 'unset',
		marginTop: '1em',
	},
}));

export default ModalContainer;
