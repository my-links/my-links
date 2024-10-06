import styled from '@emotion/styled';

const Button = styled.button<{ danger?: boolean }>(({ theme, danger }) => {
	const btnColor = !danger ? theme.colors.primary : theme.colors.lightRed;
	const btnDarkColor = !danger ? theme.colors.darkBlue : theme.colors.lightRed;
	return {
		cursor: 'pointer',
		width: '100%',
		textTransform: 'uppercase',
		fontSize: '14px',
		color: theme.colors.white,
		background: btnColor,
		padding: '0.75em',
		border: `1px solid ${btnColor}`,
		borderRadius: theme.border.radius,
		transition: theme.transition.delay,

		'&:disabled': {
			cursor: 'not-allowed',
			opacity: '0.5',
		},

		'&:not(:disabled):hover': {
			boxShadow: `${btnDarkColor} 0 0 3px 1px`,
			background: btnDarkColor,
			color: theme.colors.white,
		},
	};
});

export default Button;
