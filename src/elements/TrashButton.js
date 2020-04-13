import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components/macro';
import { ReactComponent as TrashIcon } from '../images/TrashIcon.svg';

const StyledButton = styled.button`
  display: flex;
  background: none;
  border: 0;
  outline: 0;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
  fill: #949494;
  & > span {
    position: relative;
    display: flex;
    height: 2.2rem;
    width: 1.9rem;
    justify-content: center;
    align-items: center;
    border-radius: 0.25rem;
    outline: 0;
  }
  &:focus > span {
    box-shadow: inset 0 0 0 0.125rem #D91C5C;
    fill: #D91C5C;
  }
  &:hover > span {
    fill: #D91C5C;
  }
  &:active > span {
  }
`;

const TrashButton = (props, ref) => {
  const buttonRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => {
      buttonRef.current.focus();
    }
  }));
  return (
    <StyledButton
      type="button"
      {...props}
      ref={buttonRef}
    >
      <span tabIndex="-1">
        <TrashIcon />
      </span>
    </StyledButton>
  );
};

export default forwardRef(TrashButton);
