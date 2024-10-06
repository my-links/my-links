import styled from '@emotion/styled';
import TextEllipsis from '~/components/common/text_ellipsis';
import useActiveCollection from '~/hooks/use_active_collection';

const CollectionDescriptionStyle = styled.div({
	width: '100%',
	fontSize: '0.85rem',
	marginBottom: '0.5rem',
});

export default function CollectionDescription() {
	const { activeCollection } = useActiveCollection();
	return (
		<CollectionDescriptionStyle>
			<TextEllipsis lines={3}>{activeCollection!.description}</TextEllipsis>
		</CollectionDescriptionStyle>
	);
}
