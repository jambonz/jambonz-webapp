import React, { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { NotificationDispatchContext } from '../../contexts/NotificationContext';
import styled from 'styled-components/macro';
import H1 from '../elements/H1';
import AddButton from '../elements/AddButton';
import Breadcrumbs from '../blocks/Breadcrumbs';

const PageMain = styled.main`
  height: calc(100vh - 4rem);
  width: calc(100% - 15rem);
  overflow: auto;
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
  ${props => props.type === 'form' &&
    'max-width: 61rem;'
  }
  min-width: ${props => props.type === 'form'
    ? '58rem'
    : '38rem'
  };
  @media (max-width: 34rem) {
    width: 100%;
  }
`;

const InternalTemplate = props => {
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
    <PageMain>
      {props.breadcrumbs && (
        <Breadcrumbs breadcrumbs={props.breadcrumbs} />
      )}
      <H1>{props.title}</H1>
      {props.addButtonText && (
        <AddButton
          addButtonText={props.addButtonText}
          to={props.addButtonLink}
        />
      )}
      {typeof props.subtitle === 'object'
        ? props.subtitle
        : <P>{props.subtitle}</P>
      }
      <ContentContainer
        type={props.type}
      >
        {props.children}
      </ContentContainer>
    </PageMain>
  );
};

export default InternalTemplate;
