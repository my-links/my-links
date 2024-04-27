import styled from '@emotion/styled';

const UnstyledList = styled.ul({
  '&, & li': {
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    border: 0,
  },
});

export default UnstyledList;
