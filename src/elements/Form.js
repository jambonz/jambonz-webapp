import styled from 'styled-components/macro';

const Form = styled.form`
  width: ${props => props.large
    ? '61rem'
    : '32rem'
  };
  text-align: right;
  @media (max-width: ${props => props.large
    ? '61rem'
    : '32rem'
  }) {
    width: 100%;
  }
  padding: 2rem;
  ${props => !props.large && `
    & input {
      margin-bottom: 1rem;
    }
  `}
  & hr {
    margin: 0 -2rem;
    background: none;
    border: 0;
    border-top: 1px solid #C6C6C6;
    grid-column: 1 / 3;
  }
  ${props => props.large && `
    display: grid;
    grid-template-columns: 1.3fr 10fr;
    grid-row-gap: 1rem;
    grid-column-gap: 0.75rem;
    align-items: center;
  `}
`;

export default Form;
