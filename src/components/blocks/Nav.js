/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components/macro';
import { NotificationDispatchContext } from '../../contexts/NotificationContext';
import Button from '../elements/Button';
import Label from '../elements/Label';
import Select from '../elements/Select';
import Form from '../elements/Form';
import Input from '../elements/Input';
import Modal from '../blocks/Modal';
import FormError from '../blocks/FormError';
import handleErrors from "../../helpers/handleErrors";
import { Link as ReactRouterLink } from 'react-router-dom';
import { ServiceProviderValueContext, ServiceProviderMethodContext } from '../../contexts/ServiceProviderContext';
import LogoJambong from "../../images/LogoJambong.svg";
import AddModalButton from '../elements/AddModalButton';

const StyledNav = styled.nav`
  position: relative;
  z-index: 50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.12);
`;

const LogOutContainer = styled.div`
  margin-right: 3rem;
  @media (max-width: 34rem) {
    margin-right: 1rem;
  }
`;

const StyledLink = styled(ReactRouterLink)`
  text-decoration: none;
  margin: 0 0 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
`;

const StyledForm = styled(Form)`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  left: 50%;
  transform: translate(-50%, 0);
`;

const StyledLabel = styled(Label)`
  margin-right: 1rem;
`;

const ModalContainer = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  padding: 1rem;
  width: 500;
`;

const StyledFormError = styled(FormError)`
  margin-top: 1rem;
`;

const Nav = () => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useContext(NotificationDispatchContext);
  const currentServiceProvider = useContext(ServiceProviderValueContext);
  const setCurrentServiceProvider = useContext(ServiceProviderMethodContext);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [showServiceProviderModal, setShowServiceProviderModal] = useState(false);
  const [showModalLoader, setShowModalLoader] = useState(false);
  const [serviceProviderName, setServiceProviderName] = useState("");
  const [serviceProviderInvalid, setServiceProviderInvalid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const refServiceProvider = useRef(null);

  const logOut = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    history.push('/');
    dispatch({
      type: 'ADD',
      level: 'success',
      message: "You've successfully logged out",
    });
  };

  const onChangeServiceProvider = (sp) => {
    if (sp === "add") {
      setShowServiceProviderModal(true);
    } else {
      setCurrentServiceProvider(sp);
    }
  };

  const getServiceProviders = async () => {
    const jwt = localStorage.getItem('token');
    if (history.location.pathname !== '' && jwt) {
      const serviceProvidersResponse = await axios({
        method: 'get',
        baseURL: APP_API_BASE_URL,
        url: '/ServiceProviders',
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      setServiceProviders(
        (serviceProvidersResponse.data || []).sort(
          (a, b) => a.name.localeCompare(b.name)
        )
      );

      const isExisted = serviceProvidersResponse.data.find(item => item.service_provider_sid === currentServiceProvider);
      if (!isExisted) {
        setCurrentServiceProvider(serviceProvidersResponse.data[0].service_provider_sid);
      }
    }
  };

  const handleAddServiceProvider = async () => {
    if (serviceProviderName) {
      setServiceProviderInvalid(false);
      setErrorMessage("");

      try {
        setShowModalLoader(true);
        const jwt = localStorage.getItem('token');

        const serviceProviderResponse = await axios({
          method: 'post',
          baseURL: APP_API_BASE_URL,
          url: `/ServiceProviders`,
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
          data: {
            name: serviceProviderName,
          },
        });

        setCurrentServiceProvider(serviceProviderResponse.data.sid);

        getServiceProviders();
        setShowServiceProviderModal(false);
      } catch (err) {
        handleErrors({ err, history, dispatch, setErrorMessage });
      } finally {
        setShowModalLoader(false);
      }
    } else {
      setServiceProviderInvalid(true);
      setErrorMessage("Please enter a name for Service Provider");
      if (refServiceProvider && refServiceProvider.current) {
        refServiceProvider.current.focus();
      }
    }
  };

  useEffect(() => {
    getServiceProviders();
  }, [history.location.pathname]);

  return (
    <StyledNav>
      <StyledLink to="/internal/accounts">
        <img src={LogoJambong} alt="link-img" />
      </StyledLink>
      {location.pathname !== '/' && (
        <StyledForm>
          <StyledLabel htmlFor="serviceProvider">Service Provider:</StyledLabel>
          <Select
            name="serviceProvider"
            id="serviceProvider"
            value={currentServiceProvider}
            onChange={e => onChangeServiceProvider(e.target.value)}
          >
            {serviceProviders.map(a => (
              <option
                key={a.service_provider_sid}
                value={a.service_provider_sid}
              >
                {a.name}
              </option>
            ))}
          </Select>
          <AddModalButton
            addButtonText="Add Service Provider"
            onClick={()=>setShowServiceProviderModal(true)}
          />
        </StyledForm>

      )}
      {location.pathname !== '/' && (
        <LogOutContainer>
          <Button
            large
            gray
            text
            onClick={logOut}
          >
            Log Out
          </Button>
        </LogOutContainer>
      )}
      {showServiceProviderModal && (
        <Modal
          title="Add New Service Provider"
          loader={showModalLoader}
          closeText="Close"
          actionText="Add"
          handleCancel={() => {
            setServiceProviderName("");
            setShowServiceProviderModal(false);
          }}
          handleSubmit={handleAddServiceProvider}
          content={
            <ModalContainer>
              <StyledLabel htmlFor="name">Name:</StyledLabel>
              <Input
                name="name"
                id="name"
                value={serviceProviderName}
                onChange={e => setServiceProviderName(e.target.value)}
                placeholder="Service provider name"
                invalid={serviceProviderInvalid}
                autoFocus
                ref={refServiceProvider}
              />
              {errorMessage && (
                <StyledFormError grid message={errorMessage} />
              )}
            </ModalContainer>
          }
        />
      )}
    </StyledNav>
  );
};

export default Nav;
