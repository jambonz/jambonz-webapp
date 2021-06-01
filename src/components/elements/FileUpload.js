import React, { forwardRef } from 'react';
import styled from 'styled-components/macro';

const Container = styled.div`
  position: relative;
  height: 2.25rem;
`;

const StyledInput = styled.input`
  clip: rect(1px, 1px, 1px, 1px);
  height: 1px;
  width: 1px;
  border: 0;
  margin: -1px;
  padding: 0;
  outline: none;
  white-space: nowrap;
  overflow: hidden;

  &:after {
    content: '${props => props.validFile ? 'Choose a Different File' : 'Choose File'}';
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 2.25rem;
    top: 0;
    left: 0;
    padding: 0 1rem;
    border-radius: 0.25rem;
    background: #D91C5C;
    color: #FFF;
    font-weight: 500;
    cursor: pointer;
  }

  &:focus:after {
    box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.12),
                inset 0 0 0 0.25rem #890934;
  }

  &:hover:not([disabled]):after {
    background: #BD164E;
  }

  &:active:not([disabled]):after {
    background: #A40D40;
  }
`;

const FileUpload = (props, ref) => {
  return (
    <Container>
      <StyledInput
        id={props.id}
        name={props.id}
        type="file"
        onChange={props.onChange}
        validFile={props.validFile}
      />
    </Container>
  );
};

export default forwardRef(FileUpload);
