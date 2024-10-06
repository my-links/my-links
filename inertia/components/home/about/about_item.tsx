import styled from '@emotion/styled';
import { IconType } from 'react-icons/lib';

const AboutItemStyle = styled.li(({ theme }) => ({
	width: '350px',
	display: 'flex',
	gap: '1em',
	alignItems: 'center',
	justifyContent: 'center',
	flexDirection: 'column',

	'& svg': {
		color: theme.colors.blue,
	},

	'& div': {
		fontSize: '1.25rem',
		fontWeight: '500',
	},

	'& p': {
		height: '65px',
		color: theme.colors.grey,
	},
}));

const AboutItem = ({
	title,
	text,
	icon: Icon,
}: {
	title: string;
	text: string;
	icon: IconType;
}) => (
	<AboutItemStyle>
		<Icon size={60} />
		<div>{title}</div>
		<p>{text}</p>
	</AboutItemStyle>
);

export default AboutItem;
