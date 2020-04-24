import styled from 'styled-components/macro';

const Label = styled.label`
  color: #767676;
  ${props => props.indented && `margin-right: 0.5rem;`}
  ${props => props.middle && `margin: 0 0.5rem 0 1rem;`}
  ${props => props.tooltip && `
    & > span {
      border-bottom: 1px dotted;
      border-left: 1px solid transparent;
      cursor: help;
    }
  `}
`;

export default Label;
