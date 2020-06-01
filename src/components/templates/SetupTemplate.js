import React from 'react';
import styled from 'styled-components/macro';
import ProgressVisualization from '../blocks/ProgressVisualization';
import H1 from '../elements/H1';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 1rem 8rem;
`;

const StyledH1 = styled(H1)`
  text-align: center;
`;

const Subtitle = styled.div`
  margin: -0.25rem 0 0.25rem;
  text-align: center;
`;

const ContentContainer = styled.div`
  width: ${props => props.wide
    ? '61rem'
    : '32rem'
  };
  @media (max-width: ${props => props.wide
    ? '61rem'
    : '32rem'
  }) {
    width: 100%;
  }
  margin-top: 1.25rem;
  background: #FFF;
  border-radius: 0.5rem;
  box-shadow: 0 0.25rem 0.25rem rgba(0, 0, 0, 0.1),
  0px 0px 0.25rem rgba(0, 0, 0, 0.1);
  ${props => props.wide && `
    min-width: 58rem;
  `}
  @media (max-width: 58rem) {
    align-self: flex-start;
  }
  @media (max-width: 34rem) {
    width: 100%;
  }
`;

const SetupTemplate = props => (
  <PageContainer>
    <ProgressVisualization progress={props.progress} />
    <StyledH1>{props.title}</StyledH1>
    {props.subtitle
      ? <Subtitle>{props.subtitle}</Subtitle>
      : null
    }
    <ContentContainer wide={props.wide}>
      {props.children}
    </ContentContainer>
  </PageContainer>
);

export default SetupTemplate;
