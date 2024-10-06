import styled from '@emotion/styled';
import { rgba } from '~/lib/color';

const TabItem = styled.li<{ active?: boolean; danger?: boolean }>(
	({ theme, active, danger }) => {
		const activeColor = !danger ? theme.colors.primary : theme.colors.lightRed;
		return {
			userSelect: 'none',
			cursor: 'pointer',
			backgroundColor: active
				? rgba(activeColor, 0.15)
				: theme.colors.secondary,
			padding: '10px 20px',
			border: `1px solid ${active ? rgba(activeColor, 0.1) : theme.colors.secondary}`,
			borderBottom: `1px solid ${active ? rgba(activeColor, 0.25) : theme.colors.secondary}`,
			display: 'flex',
			gap: '0.35em',
			alignItems: 'center',
			transition: '.075s',
		};
	}
);

export default TabItem;
