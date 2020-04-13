import React from 'react';
import styled from 'styled-components/macro';
import { ReactComponent as ErrorIcon } from '../images/ErrorIcon.svg';

const FormErrorContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.25rem;
  background: RGBA(217, 28, 92, 0.2);
  ${props => !props.grid && `margin-bottom: 1rem;`}
  color: #76042A;
  font-weight: 500;
  text-align: left;
  ${props => props.grid && `grid-column: 2;`}
  & > span {
    margin-left: 0.5rem;
  }
  & ul {
    margin: 0.25rem 0 0;
    padding-left: 1.5rem;
  }
  & li {
    line-height: 1.5rem;
  }
`;

const FormError = props => (
  <FormErrorContainer {...props}>
    <ErrorIcon />
    <span>
      {typeof props.message === 'object' && props.message.length ? (
        <ul>
          {props.message.map((message, i) => (
            <li key={i}>{message}</li>
          ))}
        </ul>
      ) : (
        props.message
      )}
    </span>
  </FormErrorContainer>
);

export default FormError;
