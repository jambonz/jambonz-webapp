import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import { ModalStateContext } from '../../contexts/ModalContext';

const FilteredLink = ({ addButtonText, ...props }) => (
  <Link {...props}>{props.children}</Link>
);

const StyledLink = styled(FilteredLink)`
  position: absolute;
  top: 7rem;
  right: 3rem;
  display: flex;
  padding: 0;
  border: 0;
  outline: 0;
  background: none;
  cursor: pointer;
  grid-column: 2;
  border-radius: 50%;
  text-decoration: none;
  color: #565656;
  z-index: 1;

  & > span:first-child {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    height: 3.5rem;
    width: 3.5rem;
    border-radius: 50%;
    outline: 0;
    background: #D91C5C;
    color: #FFF;
    font-size: 2.5rem;
    box-shadow: 0 0.375rem 0.25rem rgba(0, 0, 0, 0.12), 
                0 0        0.25rem rgba(0, 0, 0, 0.18);
  }

  &:focus > span:first-child {
    border: 0.25rem solid #890934;
  }

  &:hover > span:first-child {
  }

  &:active > span:first-child  {
  }
`;

const Tooltip = styled.span`
  display: none;
  color: #767676;
  a:focus > &,
  a:hover > & {
    display: inline;
    position: absolute;
    white-space: nowrap;
    right: calc(100% + 0.75rem);
    top: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 0.25rem;
    background: #FFF;
    box-shadow: 0 0.375rem 0.25rem rgba(0, 0, 0, 0.12),
                0 0        0.25rem rgba(0, 0, 0, 0.18);
    z-index: 60;
  }
`;

const AddButton = props => {
  const modalOpen = useContext(ModalStateContext);
  return (
    <StyledLink
      {...props}
      tabIndex={modalOpen ? '-1' : ''}
    >
      <span tabIndex="-1">
        +
      </span>
      <Tooltip>{props.addButtonText}</Tooltip>
    </StyledLink>
  );
};

export default AddButton;
