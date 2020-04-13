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

const P = styled.p`
  margin: 0.75rem 0 1.5rem;
  text-align: center;
`;

const ContentContainer = styled.div`
  background: #FFF;
  border-radius: 0.5rem;
  box-shadow: 0 0.25rem 0.25rem rgba(0, 0, 0, 0.1),
  0px 0px 0.25rem rgba(0, 0, 0, 0.1);
  @media (max-width: 34rem) {
    width: 100%;
  }
`;

const SetupTemplate = props => (
  <PageContainer>
    <ProgressVisualization progress={props.progress} />
    <StyledH1>{props.title}</StyledH1>
    {
      typeof props.subtitle === 'object'
        ? props.subtitle
        : <P>{props.subtitle}</P>
    }
    <ContentContainer>{props.children}</ContentContainer>
  </PageContainer>
);

export default SetupTemplate;
