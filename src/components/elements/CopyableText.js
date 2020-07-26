import React, { useContext } from 'react';
import styled from 'styled-components/macro';
import { NotificationDispatchContext } from '../../contexts/NotificationContext';
import Button from './Button';

const Span = styled.span`
  text-align: left;
  ${props => props.hasBorder ? `
    height: 2.25rem;
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0 1rem;
    border: 1px solid #B6B6B6;
    border-radius: 0.125rem;
  ` : ''}
`;

const StyledButton = styled(Button)`
  margin-left: 1rem;
`;

const CopyableText = props => {
  const dispatch = useContext(NotificationDispatchContext);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(props.text);
      dispatch({
        type: 'ADD',
        level: 'success',
        message: `${props.textType} copied to clipboard`,
      });
    } catch (err) {
      dispatch({
        type: 'ADD',
        level: 'error',
        message: `Unable to copy ${props.textType}, please select the text and right click to copy`,
      });
    }
  };

  return (
    <Span hasBorder={props.hasBorder}>
      {props.text}
      <StyledButton
        text
        formLink
        inModal={props.inModal}
        type="button"
        onClick={copyText}
      >
        copy
      </StyledButton>
    </Span>
  );
};

export default CopyableText;
