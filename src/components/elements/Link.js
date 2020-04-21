import React, { useContext } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import styled from 'styled-components/macro';
import { ModalStateContext } from '../../contexts/ModalContext';

const FilteredLink = ({ formLink, right, inModal, ...props }) => (
  <ReactRouterLink {...props}>{props.children}</ReactRouterLink>
);

const StyledReactRouterLink = styled(FilteredLink)`
  display: inline-flex;
  padding: 0;
  border: 0;
  outline: 0;
  background: none;
  cursor: pointer;
  color: #D91C5C;
  font-weight: 500;
  text-decoration: none;

  & > span {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    outline: 0;
  }

  &:focus > span {
    padding: 0.25rem;
    margin: -0.25rem;
    border-radius: 0.25rem;
    box-shadow: 0 0 0 0.125rem #D91C5C;
  }

  &:hover > span {
    box-shadow: 0 0.125rem 0 #D91C5C;
    border-radius: 0;
  }

  &:active > span {}

  ${props => props.formLink && `
    grid-column: 2;
    justify-self: start;
  `}

  ${props => props.right && `
    justify-self: end;
  `}
`;

const Link = props => {
  const modalOpen = useContext(ModalStateContext);
  return (
    <StyledReactRouterLink
      {...props}
      tabIndex={modalOpen && !props.inModal ? '-1' : ''}
    >
      <span tabIndex="-1">
        {props.children}
      </span>
    </StyledReactRouterLink>
  );
};

export default Link;