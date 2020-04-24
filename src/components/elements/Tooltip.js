import styled from 'styled-components/macro';

const Tooltip = styled.span`
  display: none;
  label > span:hover > & {
    display: inline;
    position: absolute;
    bottom: 100%;
    right: calc(50% - 1rem);
    transform: translateX(50%);
    padding: 0.75rem 1rem;
    border-radius: 0.25rem;
    background: #FFF;
    box-shadow: 0 0.375rem 0.25rem rgba(0, 0, 0, 0.12),
                0 0        0.25rem rgba(0, 0, 0, 0.18);
    z-index: 80;
    ${props => !props.large ? `
      white-space: nowrap;
    ` : `
        text-align: left;
        width: 22rem;
        bottom: calc(100% + 0.5rem);
    `}
    }
  }
`;

export default Tooltip;
