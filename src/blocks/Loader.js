import React from 'react';

import styled from 'styled-components/macro';

const Container = styled.div`
  padding: 2rem;
  ${props => props.height && `
    height: ${props.height};
  `}
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Spinner = styled.div`
  height: 3rem;
  width: 3rem;
  border: 4px solid #E3E3E3;
  border-top-color: #D91C5C;
  border-radius: 50%;
  animation: spin 1.25s linear infinite;

  @keyframes spin {
    0%   { transform: rotate(-45deg); }
    100% { transform: rotate(315deg); }
  }
`;

const Loader = props => {
  return (
    <Container height={props.height}>
      <Spinner />
    </Container>
  );
};

export default Loader;
