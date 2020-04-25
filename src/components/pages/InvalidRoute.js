import React, { useState, useEffect } from 'react';
import styled from 'styled-components/macro';
import SetupTemplate from '../templates/SetupTemplate';
import InternalTemplate from '../templates/InternalTemplate';
import Link from '../elements/Link';

const Container = styled.div`
  padding: 4rem;
  text-align: center;
`;

const InvalidRoute = () => {
  const [ isLoggedIn, setIsLoggedIn ] = useState(false);
  useEffect(() => {
    if (localStorage.getItem('token')) {
      setIsLoggedIn(true);
    }
  }, [isLoggedIn]);

  return (
    isLoggedIn ? (
      <InternalTemplate title="Invalid Route">
        <Container>
          That page doesn't exist.
        </Container>
      </InternalTemplate>
    ) : (
      <SetupTemplate title="Invalid Route">
        <Container>
          <p>That page doesn't exist.</p>
          <p><Link to="/">Log In</Link></p>
        </Container>
      </SetupTemplate>
    )
  );
};

export default InvalidRoute;
