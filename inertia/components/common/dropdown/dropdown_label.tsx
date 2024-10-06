import styled from '@emotion/styled';

const DropdownLabel = styled.div(({ theme }) => ({
	height: 'auto',
	width: 'auto',
	color: theme.colors.font,
	display: 'flex',
	gap: '0.35em',
}));

export default DropdownLabel;
