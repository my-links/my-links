import styled from '@emotion/styled';
import { rgba } from '~/lib/color';

const RoundedImage = styled.img(({ theme }) => {
	const transparentBlack = rgba(theme.colors.black, 0.1);
	return {
		borderRadius: '50%',

		'&:hover': {
			boxShadow: `0 1px 3px 0 ${transparentBlack}, 0 1px 2px -1px ${transparentBlack}`,
		},
	};
});

export default RoundedImage;
