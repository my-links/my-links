import styled from '@emotion/styled';
import UnstyledList from '~/components/common/unstyled/unstyled_list';

const AboutList = styled(UnstyledList)({
	margin: '4em 0 !important',
	display: 'flex',
	gap: '2em',
	alignItems: 'center',
	justifyContent: 'center',
	flexWrap: 'wrap',
});

export default AboutList;
