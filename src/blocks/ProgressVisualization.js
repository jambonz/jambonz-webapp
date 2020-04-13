import React from 'react';
import styled from 'styled-components/macro';

const Container = styled.div`
  height: 8rem;
  width: 45rem;
  max-width: 100%;
  padding: 3.5rem;
  @media (max-width: 30rem) {
    padding: 1.5rem;
  }
  display: flex;
  align-items: center;
`;

const Step = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  font-size: 0.8rem;
  font-weight: bold;
  color: #FFF;
  height: 1.5rem;
  width: 1.5rem;
  border-radius: 50%;
  ${props => props.incomplete ? `
      border: 0.25rem solid #A6A6A6;
      box-shadow: 0 3px 3px rgba(0, 0, 0, 0.08),
                  0 0 3px rgba(0, 0, 0, 0.08),
                  inset 0 3px 3px rgba(0, 0, 0, 0.08),
                  inset 0 0 3px rgba(0, 0, 0, 0.08);
    ` : `
      background: #D91C5C;
      box-shadow: 0 3px 3px rgba(0, 0, 0, 0.08),
                      0 0 3px rgba(0, 0, 0, 0.08);
    `
  }
  z-index: 2;
`;

const Line = styled.div`
  width: 50%;
  height: 0.25rem;
  margin: -2px;
  background: ${props => props.incomplete
    ? '#A6A6A6'
    : '#D91C5C'
  };
`;

const Checkmark = styled.div`
  height: 6px;
  width: 11px;
  border-left: 2px solid #FFF;
  border-bottom: 2px solid #FFF;
  transform: rotate(-45deg);
`;

const Title = styled.span`
  position: absolute;
  top: 2.5rem;
  text-align: center;
  white-space: nowrap;
  @media (max-width: 30rem) {
    white-space: normal;
  }
  color: ${props => props.active ? '#D91C5C' : '#767676'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
`;

const ProgressVisualization = props => (
  !props.progress
    ? <Container />
    : <Container>
        <Step>
          {props.progress === 1
            ? '1'
            : <Checkmark />
          }
          <Title active={props.progress === 1}>
            Configure Account
          </Title>
        </Step>
        <Line incomplete={props.progress < 2} />
        <Step incomplete={props.progress < 2} >
          {props.progress < 2
            ? null
            : props.progress === 2
              ? '2'
              : <Checkmark />
          }
          <Title active={props.progress === 2}>
            Create Application
          </Title>
        </Step>
        <Line incomplete={props.progress < 3} />
        <Step incomplete={props.progress < 3} >
          {props.progress < 3
            ? null
            : props.progress === 3
              ? '3'
              : <Checkmark />
          }
          <Title active={props.progress === 3}>
            Configure SIP Trunk
          </Title>
        </Step>
      </Container>
);

export default ProgressVisualization;
