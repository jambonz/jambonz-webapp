import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components/macro';

const StyledButton = styled.button`
  display: inline-flex;
  padding: 0;
  border: 0;
  outline: 0;
  background: none;
  cursor: pointer;
  border-radius: 0.25rem;
  grid-column: 2;
  ${props => props.fullWidth
    ? `width: 100%;`
    : `justify-self: start;`
  }
  ${props => props.bottomGap && `
    margin-bottom: 1rem;
  `}

  & > span {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    outline: 0;
    height: ${
      props => props.large
        ? '3rem'
        : '2.25rem'
    };
    ${props => props.fullWidth && `
      width: 100%;
    `}
    ${props => props.square
      ? `width: 2.25rem;`
      : `padding: 0 1rem;`
    }
    border-radius: 0.25rem;
    background: ${
      props => props.text
        ? 'none'
        : props.gray
          ? '#E3E3E3'
          : '#D91C5C'
    };
    color: ${
      props => props.gray
        ? '#565656'
        : props.text
          ? '#D91C5C'
          : '#FFF'
    };
    font-weight: 500;
  }

  &:focus > span {
    box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.12),
                inset 0 0 0
                ${props => props.text
                  ? '0.125rem'
                  : '0.25rem'
                }
                ${props => props.gray
                  ? '#767676'
                  : '#890934'
                };
  }

  &:hover > span {
    ${props => props.text
      ? `background: #E3E3E3;`
      : 'background: #BD164E;'
    }
  }

  &:active > span  {
    ${props => props.text
      ? `background: #D5D5D5;`
      : 'background: #A40D40;'
    }
  }

  ${props => props.formLink && `
    justify-self: start;

    & > span {
      height: auto;
      padding: 0;
    }

    &:focus > span {
      padding: 0.25rem;
      margin: -0.25rem;
      border-radius: 0.25rem;
      box-shadow: 0 0 0 0.125rem #D91C5C;
    }

    &:hover > span {
      background: none;
      box-shadow: 0 0.125rem 0 #D91C5C;
      border-radius: 0;
    }

    &:active > span {
      background: none;
    }
  `}

  ${props => props.right && `
    justify-self: end;
  `}
`;

const Button = (props, ref) => {
  const buttonRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => {
      buttonRef.current.focus();
    }
  }));
  return (
    <StyledButton
      {...props}
      ref={buttonRef}
    >
      <span tabIndex="-1">
        {props.children}
      </span>
    </StyledButton>
  );
};

export default forwardRef(Button);
