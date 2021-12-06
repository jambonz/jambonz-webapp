import styled from 'styled-components/macro';

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

export default Span;