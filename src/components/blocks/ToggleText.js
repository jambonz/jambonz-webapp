import React, { useState } from 'react';
import styled from 'styled-components/macro';
import { ReactComponent as ViewPassword } from '../../images/ViewPassword.svg';
import { ReactComponent as HidePassword } from '../../images/HidePassword.svg';

const Container = styled.span`
  position: relative;
`;

const ToggleVisibilityButton = styled.button`
  position: absolute;
  top: -0.5rem;
  left: 22rem;
  width: 2.5rem;
  cursor: pointer;
  background: none;
  border: 0;
  outline: 0;
  padding: 0;

  & > span {
    height: 2.25rem;
    width: 2.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    outline: 0;
    border-radius: 0.25rem;
    fill: #767676;
  }

  &:hover > span {
    fill: #565656;
  }

  &:focus > span {
    box-shadow: inset 0 0 0 0.125rem #767676;
  }
`;

const ToggleText = props => {
  const [ mode, setMode ] = useState('masked');
  return (
    <Container>
      {mode === 'masked' ? props.masked : props.revealed}
      <ToggleVisibilityButton
        onClick={() => setMode(mode === 'masked' ? 'revealed' : 'masked')}
      >
        <span tabIndex="-1">
          {mode === 'masked'
            ? <ViewPassword />
            : <HidePassword />
          }
        </span>
      </ToggleVisibilityButton>
    </Container>
  );
};

export default ToggleText;
