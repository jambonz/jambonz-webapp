import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components/macro';
import { ReactComponent as ViewPassword } from '../images/ViewPassword.svg';
import { ReactComponent as HidePassword } from '../images/HidePassword.svg';

const Container = styled.div`
  position: relative;
  flex-grow: 1;
  display: flex;
  align-items: center;
  ${props => props.width && `
    width: ${props.width};
  `}
`;

const StyledInput = styled.input`
  height: ${props => props.large
    ? '3rem'
    : '2.25rem'
  };
  width: 100%;
  padding: 0 1rem;
  border: 1px solid #B6B6B6;
  ${props => props.invalid && `
    background: RGBA(217,28,92,0.2);
    border-color: #D91C5C;
  `}
  border-radius: 0.125rem;
  color: inherit;
  &:focus {
    border-color: ${props => props.invalid
      ? '#890934;'
      : '#565656;'
    }
    outline: none;
    box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.12);
  }
`;

const PasswordButton = styled.button`
  position: absolute;
  top: 0.375rem;
  right: 1rem;
  height: 2.25rem;
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
    fill: #D91C5C;
  }

  &:hover > span {
    fill: #BD164E;
  }

  &:focus > span {
    box-shadow: inset 0 0 0 0.125rem #890934;
  }
`;

const Input = (props, ref) => {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    }
  }));
  return (
    <Container
      width={props.width}
    >
      <StyledInput
        {...props}
        ref={inputRef}
      />
      {
        props.allowShowPassword &&
        <PasswordButton
          type="button"
          onClick={props.toggleShowPassword}
        >
          <span tabIndex="-1">
            {
              props.showPassword
                ? <HidePassword />
                : <ViewPassword />
            }
          </span>
        </PasswordButton>
      }
    </Container>
  );
};

export default forwardRef(Input);
