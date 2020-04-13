import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components/macro';
import Label from './Label';

const CheckboxContainer = styled.div`
  margin-left: ${props => props.invalid
    ? '0.5rem'
    : '1rem'
  };
  position: relative;
  display: flex;
  align-items: center;
  height: 3rem;
  ${props => props.invalid && `
    margin-right: -0.5rem;
    padding: 0 0.5rem;
    border: 1px solid #D91C5C;
    border-radius: 0.125rem;
    background: RGBA(217,28,92,0.2);
  `}
`;

const StyledCheckbox = styled.input`
  margin: 0.25rem;
  width: 1rem;
  height: 1rem;
`;

const StyledLabel = styled(Label)`
  margin-left: 0.5rem;
  cursor: pointer;
  ${props => props.tooltip && `
    & > span {
      border-bottom: 1px dotted;
      border-left: 1px solid transparent;
      cursor: help;
    }
  `}

  &::before {
    content: '';
    position: absolute;
    top: 0.75rem;
    left: ${props => props.invalid
      ? '0.5rem'
      : '0'
    };
    width: 1.5rem;
    height: 1.5rem;
    border: 1px solid #A5A5A5;
    border-radius: 0.125rem;
    background: #FFF;
  }

  input:focus + &::before {
    border-color: #565656;
    box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.12);
  }

  input:checked + &::before {
    background: #D91C5C;
    border-color: #D91C5C;
  }

  input:checked:focus + &::before {
    border: 3px solid #890934;
  }

  input:checked + &::after {
    content: '';
    position: absolute;
    top: 1.1rem;
    left: ${props => props.invalid
      ? '0.75rem'
      : '0.25rem'
    };
    height: 8px;
    width: 15px;
    border-left: 2px solid #FFF;
    border-bottom: 2px solid #FFF;
    transform: rotate(-45deg);
  }
`;

const Tooltip = styled.span`
  display: none;
  label > span:hover > & {
    display: inline;
    position: absolute;
    white-space: nowrap;
    bottom: calc(100%);
    right: calc(50% - 1rem);
    transform: translateX(50%);
    padding: 0.75rem 1rem;
    border-radius: 0.25rem;
    background: #FFF;
    box-shadow: 0 0.375rem 0.25rem rgba(0, 0, 0, 0.12),
                0 0        0.25rem rgba(0, 0, 0, 0.18);
    z-index: 101;
  }
`;

const Checkbox = (props, ref) => {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    }
  }));
  return (
    <CheckboxContainer
      invalid={props.invalid}
    >
      <StyledCheckbox
        id={props.id}
        name={props.id}
        type="checkbox"
        checked={props.checked}
        onChange={props.onChange}
        ref={inputRef}
      />
      <StyledLabel
        htmlFor={props.id}
        tooltip={props.tooltip}
        invalid={props.invalid}
      >
        <span>
          {props.label}
          {
            props.tooltip &&
            <Tooltip>
              {props.tooltip}
            </Tooltip>
          }
        </span>
      </StyledLabel>
    </CheckboxContainer>
  );
};

export default forwardRef(Checkbox);
