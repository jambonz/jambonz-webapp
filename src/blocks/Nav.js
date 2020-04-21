import React, { useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components/macro';
import { NotificationDispatchContext } from '../contexts/NotificationContext';
import Button from '../elements/Button';

const StyledNav = styled.nav`
  position: relative;
  z-index: 50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.12);
`;

const NavH1 = styled.h1`
  margin: 1.25rem 0 1.25rem 2rem;
  font-size: 1.5rem;
  font-weight: normal;
  line-height: 1em;
`;

const LogOutContainer = styled.div`
  margin-right: 3rem;
  @media (max-width: 34rem) {
    margin-right: 1rem;
  }
`;

const Nav = () => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useContext(NotificationDispatchContext);

  const logOut = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    history.push('/');
    dispatch({
      type: 'ADD',
      level: 'success',
      message: "You've successfully logged out",
    });
  };

  return (
    <StyledNav>
      <NavH1>Jambonz</NavH1>
      {location.pathname !== '/' && (
        <LogOutContainer>
          <Button
            large
            gray
            text
            onClick={logOut}
          >
            Log Out
          </Button>
        </LogOutContainer>
      )}
    </StyledNav>
  );
};

export default Nav;
