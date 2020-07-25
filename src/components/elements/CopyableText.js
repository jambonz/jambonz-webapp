import React, { useContext } from 'react';
import styled from 'styled-components/macro';
import { NotificationDispatchContext } from '../../contexts/NotificationContext';
import Button from './Button';

const Span = styled.span`
  text-align: left;
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
    <Span>
      {props.text}
      <StyledButton
        text
        formLink
        type="button"
        onClick={copyText}
      >
        copy
      </StyledButton>
    </Span>
  );
};

export default CopyableText;
