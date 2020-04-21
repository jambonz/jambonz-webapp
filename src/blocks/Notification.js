import React, { useContext } from 'react';
import styled from 'styled-components/macro';
import { NotificationDispatchContext } from '../contexts/NotificationContext';
import { ReactComponent as CheckGreen } from '../images/CheckGreen.svg';
import { ReactComponent as ErrorIcon } from '../images/ErrorIcon.svg';

const NotificationContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  z-index: 100;
`;

const NotificationDiv = styled.div`
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 28rem;
  padding: 0.75rem;
  background: #fff;
  border: 1px solid ${props => (
    props.level === 'success'
      ? '#61c43e'
      : props.level === 'error'
        ? '#D91C5C'
        : '#949494'
  )};
  border-radius: 0.25rem;
  box-shadow: 0 0.375rem 0.25rem rgba(0, 0, 0, 0.12),
              0 0        0.25rem rgba(0, 0, 0, 0.18);
  pointer-events: auto;
  & svg {
    flex-shrink: 0;
    margin-right: 0.75rem;
  }
`;

const CloseButton = styled.button`
  display: flex;
  padding: 0;
  border: 0;
  outline: 0;
  background: none;
  cursor: pointer;

  flex-shrink: 0;
  margin-left: 0.25rem;
  border-radius: 0.25rem;
  font-size: 1.5rem;
  color: #767676;

  & > span {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    height: 2rem;
    width: 2rem;
    padding: 0.25rem;
    border: 2px solid transparent;
    border-radius: 0.25rem;
    outline: 0;
  }

  &:focus > span {
    border-color: #767676;
  }

  &:hover > span {
    color: #d91c5c;
  }
`;

const InfoIcon = styled.span`
  flex-shrink: 0;
  margin-right: 0.75rem;
  height: 1.5rem;
  width: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: #949494;
  color: #FFF;
  font-size: 1.2rem;
  font-weight: bold;
`;

const Notification = props => {
  const dispatch = useContext(NotificationDispatchContext);
  return (
    <NotificationContainer>
      {props.notifications.map(n => (
        <NotificationDiv
          key={n.id}
          level={n.level}
        >
          {n.level === 'success'
            ? <CheckGreen />
            : n.level === 'error'
              ? <ErrorIcon />
              : <InfoIcon>i</InfoIcon>
          }
          <span>{n.message}</span>
          <CloseButton
            onClick={() => {
              dispatch({
                type: 'REMOVE',
                id: n.id,
              });
            }}
          >
            <span tabIndex="-1">&times;</span>
          </CloseButton>
        </NotificationDiv>
      ))}
    </NotificationContainer>
  );
};

export default Notification;
