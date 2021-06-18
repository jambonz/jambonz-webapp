import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components/macro';
import Label from './Label';
import Tooltip from './Tooltip';

const RadioContainer = styled.div`
  margin-left: ${props => props.noLeftMargin
    ? '-0.5rem'
    : '0.5rem'
  };
  position: relative;
  display: flex;
  align-items: center;
  height: 2.25rem;
  padding: 0 0.5rem;
  border: 1px solid transparent;
  border-radius: 0.125rem;
  ${props => props.invalid && `
    border-color: #D91C5C;
    background: RGBA(217,28,92,0.2);
  `}
`;

const StyledRadio = styled.input`
  outline: none;
  margin: 0.25rem;
  width: 1rem;
  height: 1rem;
`;

const StyledLabel = styled(Label)`
  padding-left: 0.5rem;
  cursor: ${props => props.disabled
    ? 'not-allowed'
    : 'pointer'
  };
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
    top: 0.375rem;
    left: 0.5rem;
    width: 1.5rem;
    height: 1.5rem;
    border: 1px solid #A5A5A5;
    border-radius: 50%;
    background: #FFF;
  }

  input:focus + &::before {
    border-color: #565656;
    box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.12);
  }

  input:checked + &::after {
    content: '';
    position: absolute;
    top: 10px;
    left: 0.75rem;
    height: 1rem;
    width: 1rem;
    border-radius: 50%;
    background: ${props => props.disabled
      ? '#959595'
      : '#707070'
    };
  }
`;

const Radio = (props, ref) => {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    }
  }));
  return (
    <RadioContainer
      invalid={props.invalid}
      noLeftMargin={props.noLeftMargin}
    >
      <StyledRadio
        name={props.name}
        id={props.id}
        value={props.id}
        type="radio"
        checked={props.checked}
        onChange={props.onChange}
        ref={inputRef}
        disabled={props.disabled}
      />
      <StyledLabel
        htmlFor={props.id}
        tooltip={props.tooltip}
        invalid={props.invalid}
        disabled={props.disabled}
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
    </RadioContainer>
  );
};

export default forwardRef(Radio);
