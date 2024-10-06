import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import { FcGoogle } from 'react-icons/fc';

const NoSearchResultStyle = styled.i({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	gap: '0.25em',

	'& > span': {
		display: 'flex',
		alignItems: 'center',
	},
});

export default function NoSearchResult() {
	const { t } = useTranslation('common');
	return (
		<NoSearchResultStyle>
			{t('search-with')}
			{''}
			<span>
				<FcGoogle size={20} />
				oogle
			</span>
		</NoSearchResultStyle>
	);
}
