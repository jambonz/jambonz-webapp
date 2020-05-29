import React, { useEffect, useContext } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { ModalStateContext } from '../../contexts/ModalContext';
import { NotificationDispatchContext } from '../../contexts/NotificationContext';
import styled from 'styled-components/macro';
import H1 from '../elements/H1';
import { ReactComponent as AccountsIcon } from '../../images/AccountsIcon.svg';
import { ReactComponent as ApplicationsIcon } from '../../images/ApplicationsIcon.svg';
import { ReactComponent as SipTrunksIcon } from '../../images/SipTrunksIcon.svg';
import { ReactComponent as PhoneNumbersIcon } from '../../images/PhoneNumbersIcon.svg';
import { ReactComponent as SettingsIcon } from '../../images/SettingsIcon.svg';
import AddButton from '../elements/AddButton';
import Breadcrumbs from '../blocks/Breadcrumbs';

const PageContainer = styled.div`
  display: flex;
`;

const SideMenu = styled.div`
  width: 15rem;
  flex-shrink: 0;
  height: calc(100vh - 4rem);
  overflow: auto;
  background: #FFF;
  padding-top: 3.25rem;
`;

const activeClassName = 'nav-item-active';

const StyledNavLink = styled(NavLink).attrs({ activeClassName })`
  height: 2.75rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: stretch;
  font-weight: 500;
  text-decoration: none;
  color: #565656;
  fill: #565656;

  &.${activeClassName} {
    box-shadow: inset 3px 0 0 0 #D91C5C;
    color: #D91C5C;
    fill: #D91C5C;
  }

  &:focus {
    outline: 0;
    box-shadow: inset 0 0 0 3px #D91C5C;
  }

  &:hover {
    background: RGBA(217, 28, 92, 0.1);
    color: #C0134D;
    fill: #C0134D;
  }
  &.${activeClassName}:hover {
    color: #D91C5C;
    fill: #D91C5C;
  }
`;

const IconContainer = styled.span`
  width: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: 0;
`;

const MenuText = styled.span`
  display: flex;
  flex-grow: 1;
  align-items: center;
  outline: 0;
`;

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

const MenuLink = props => {
  const modalOpen = useContext(ModalStateContext);
  return (
    <StyledNavLink
      to={props.to}
      activeClassName={activeClassName}
      tabIndex={modalOpen ? '-1' : ''}
    >
      <IconContainer tabIndex="-1">
        {props.icon}
      </IconContainer>
      <MenuText tabIndex="-1">
        {props.name}
      </MenuText>
    </StyledNavLink>
  );
};

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
    <PageContainer>
      <SideMenu>
        <MenuLink to="/internal/accounts"      name="Accounts"      icon={<AccountsIcon     />} />
        <MenuLink to="/internal/applications"  name="Applications"  icon={<ApplicationsIcon />} />
        <MenuLink to="/internal/sip-trunks"    name="SIP Trunks"    icon={<SipTrunksIcon    />} />
        <MenuLink to="/internal/phone-numbers" name="Phone Numbers" icon={<PhoneNumbersIcon />} />
        <MenuLink to="/internal/settings" name="Settings" icon={<SettingsIcon />} />
      </SideMenu>
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
    </PageContainer>
  );
};

export default InternalTemplate;
