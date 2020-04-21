import React from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components/macro';
import { ReactComponent as MenuDots } from '../../images/MenuDots.svg';

const Button = styled.button`
  background: none;
  padding: 0;
  border: 0;
  outline: 0;
  border-radius: 50%;

  & > span {
    background: ${props => props.selected
      ? '#E3E3E3'
      : 'none'
    };
    height: 3rem;
    width: 3rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    outline: 0;
    fill: #767676;
    cursor: pointer;
  }

  &:focus > span {
    border: 2px solid #D91C5C;
    background: ${props => props.selected
      ? 'RGBA(217, 28, 92, 0.15)'
      : 'none'
    };
    fill: #D91C5C;
  }

  &:hover > span {
    background: ${props => props.selected
      ? 'RGBA(217, 28, 92, 0.15)'
      : 'none'
    };
    fill: #D91C5C;
  }
`;

const Container = styled.div`
  position: absolute;
  right: 1.75rem;
  top: 3rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0.5rem 0;
  border-radius: 0.25rem;
  background: #fff;
  box-shadow: 0 0.5rem 0.5rem rgba(0, 0, 0, 0.12),
              0 0      0.5rem rgba(0, 0, 0, 0.12);
  z-index: 70;
`;

const buttonLink = css`
  white-space: nowrap;
  text-decoration: none;
  display: flex;
  justify-content: stretch;
  color: #565656;
  outline: none;

  & > span {
    outline: none;
    line-height: 1rem;
    padding: 1rem;
    flex-grow: 1;
    text-align: left;
  }

  &:focus > span {
    box-shadow: inset 0 0 0 0.125rem #D91C5C;
  }

  &:hover > span {
    background: #EEE;
  }
`;

const MenuLink = styled(Link)`
  ${buttonLink}
`;

const MenuButton = styled.button`
  ${buttonLink}
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
`;

const TableMenu = props => (
  <React.Fragment>
    <Button
      selected={props.open}
      disabled={props.disabled}
      onClick={e => {
        e.stopPropagation();
        props.handleMenuOpen(props.sid);
      }}
    >
      <span tabIndex="-1">
        <MenuDots />
      </span>
    </Button>
    {props.open && (
      <Container>
        {props.menuItems.map((m, i) => (
          m.type === 'link'
            ? <MenuLink key={i} to={m.url}>
                <span tabIndex="-1">
                  {m.name}
                </span>
              </MenuLink>
            : <MenuButton key={i}
                onClick={m.action}
              >
                <span tabIndex="-1">
                  {m.name}
                </span>
              </MenuButton>
        ))}
      </Container>
    )}
  </React.Fragment>
);

export default TableMenu;
