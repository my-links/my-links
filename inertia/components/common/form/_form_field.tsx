import styled from '@emotion/styled';

const FormField = styled('div', {
  shouldForwardProp: (propName) => propName !== 'required',
})<{ required?: boolean }>(({ required, theme }) => ({
  display: 'flex',
  gap: '0.25em',
  flexDirection: 'column',

  '& label': {
    position: 'relative',
    userSelect: 'none',
    width: 'fit-content',
  },

  '& label::after': {
    position: 'absolute',
    top: 0,
    right: '-0.75em',
    color: theme.colors.red,
    content: (required ? '"*"' : '""') as any,
  },
}));

export default FormField;
