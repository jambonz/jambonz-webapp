import styled from 'styled-components/macro';

const Label = styled.label`
  color: #767676;
  ${props => props.indented && `margin-right: 0.5rem;`}
  ${props => props.middle && `margin: 0 0.5rem 0 1rem;`}
`;

export default Label;
