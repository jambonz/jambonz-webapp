import styled from 'styled-components/macro';

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  grid-column: 2;
  ${props => props.flexEnd && 'justify-content: flex-end;'}
  ${props => props.spaced && `
    & > * {
      margin-right: 1rem;
    }
    & > *:last-child {
      margin-right: 0;
    }
  `}
`;

export default InputGroup;
