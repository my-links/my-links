import styled from '@emotion/styled';

const TextEllipsis = styled.p<{ lines?: number }>(({ lines = 1 }) => {
	if (lines > 1) {
		return {
			overflow: 'hidden',
			display: '-webkit-box',
			WebkitLineClamp: lines,
			WebkitBoxOrient: 'vertical',
		};
	}

	return {
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
	};
});

export default TextEllipsis;
