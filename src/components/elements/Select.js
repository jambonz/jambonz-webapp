import styled from 'styled-components/macro';

const Select = styled.select`
  height: ${props => props.large
    ? '3rem'
    : '2.25rem'
  };
  padding: 0 0.75rem;
  border: 1px solid #B6B6B6;
  border-radius: 0.125rem;
  background: #fff;
  color: inherit;
  &:focus {
    border-color: #565656;
    outline: none;
    box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.12);
  }
  ${props => props.invalid && `
    background: RGBA(217,28,92,0.2);
    border-color: #D91C5C;
    &:focus {
      border-color: #890934;
    }
  `}

  &:disabled {
    background: #DDD;
    cursor: not-allowed;
  }
`;

export default Select;
