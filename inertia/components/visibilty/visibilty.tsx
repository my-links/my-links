import { Visibility } from '#enums/visibility';
import styled from '@emotion/styled';
import { IoEarthOutline } from 'react-icons/io5';

const VisibilityStyle = styled.span(({ theme }) => ({
  fontWeight: 300,
  fontSize: '0.6em',
  color: theme.colors.lightBlue,
  border: `1px solid ${theme.colors.lightBlue}`,
  borderRadius: '50px',
  padding: '0.15em 0.65em',
  display: 'flex',
  gap: '0.35em',
  alignItems: 'center',
}));

const VisibilityBadge = ({
  label,
  visibility,
}: {
  label: string;
  visibility: Visibility;
}) =>
  visibility === Visibility.PUBLIC && (
    <VisibilityStyle>
      {label} <IoEarthOutline size="1em" />
    </VisibilityStyle>
  );

export default VisibilityBadge;
