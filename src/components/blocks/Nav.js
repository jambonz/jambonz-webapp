import React, { useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components/macro';
import { NotificationDispatchContext } from '../../contexts/NotificationContext';
import Button from '../elements/Button';
import { Link as ReactRouterLink } from 'react-router-dom';

import LogoJambong from "../../images/LogoJambong.svg";

const StyledNav = styled.nav`
  position: relative;
  z-index: 50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.12);
`;

const LogOutContainer = styled.div`
  margin-right: 3rem;
  @media (max-width: 34rem) {
    margin-right: 1rem;
  }
`;

const StyledLink = styled(ReactRouterLink)`
  text-decoration: none;
  margin: 0 0 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
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
      <StyledLink to="/internal/accounts">
        <img src={LogoJambong} alt="link-img" />
      </StyledLink>
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
