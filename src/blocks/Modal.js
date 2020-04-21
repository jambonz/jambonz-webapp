import React, { useEffect, useContext } from 'react';
import { ModalDispatchContext } from '../contexts/ModalContext';
import styled from 'styled-components/macro';
import Button from '../elements/Button';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: rgba(0,0,0,0.6);
  z-index: 90;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled.div`
  padding: 2rem;
  border-radius: 0.5rem;
  background: #FFF;
  & h1 {
    margin-top: 0;
    font-size: 1.25rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 1rem -0.5rem -0.5rem 0;
  & > * {
    margin-left: 1rem;
  }
`;

const Modal = props => {

  // Handle modal context, which tells other elements to be disabled while modal is open
  const setModalOpen = useContext(ModalDispatchContext);
  useEffect(() => {
    setModalOpen(true);
    return () => setModalOpen(false);
  });

  // Lock scroll on desktop and Android
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => document.body.style.overflow = 'auto';
  });

  // Lock scroll on iOS
  useEffect(() => {
    const stopTouchScroll = e => e.preventDefault();
    window.addEventListener('touchmove', stopTouchScroll);
    return () => window.removeEventListener('touchmove', stopTouchScroll);
  });

  // Close modal on Escape
  useEffect(() => {
    const closeOnEsc = e => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        props.handleCancel();
      }
    };
    window.addEventListener('keydown', closeOnEsc);
    return () => window.removeEventListener('keydown', closeOnEsc);
  });

  return (
    <Overlay onClick={props.handleCancel}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <h1>{props.title}</h1>
        {props.content}
        <ButtonContainer>
          <Button inModal gray onClick={props.handleCancel}>
            Cancel
          </Button>
          <Button inModal onClick={props.handleSubmit}>
            {props.actionText}
          </Button>
        </ButtonContainer>
      </ModalContainer>
    </Overlay>
  );
};

export default Modal;
