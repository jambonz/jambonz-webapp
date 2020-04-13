import React, { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { NotificationDispatchContext } from '../contexts/NotificationContext';
import styled from 'styled-components/macro';
import H1 from '../elements/H1';

const PageContainer = styled.div`
  display: flex;
`;

const SideMenu = styled.div`
  width: 15rem;
  min-height: calc(100vh - 4rem);
  background: #FFF;
  z-index: -1;
`;

const PageMain = styled.main`
  padding: 2.5rem 3rem;
`;

const P = styled.p`
  margin: 0.75rem 0 1.5rem;
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

const SetupTemplate = props => {
  const history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      history.push('/');
      dispatch({
        type: 'ADD',
        level: 'error',
        message: 'You must log in to view that page.',
      });
    }
  }, [history, dispatch]);

  return (
    <PageContainer>
      <SideMenu />
      <PageMain>
        <H1>{props.title}</H1>
        {
          typeof props.subtitle === 'object'
            ? props.subtitle
            : <P>{props.subtitle}</P>
        }
        <ContentContainer>{props.children}</ContentContainer>
      </PageMain>
    </PageContainer>
  );
};

export default SetupTemplate;
