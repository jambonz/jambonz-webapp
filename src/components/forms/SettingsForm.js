/* eslint-disable no-undef */
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { NotificationDispatchContext } from '../../contexts/NotificationContext';
import { ShowMsTeamsDispatchContext } from '../../contexts/ShowMsTeamsContext';
import Form from '../elements/Form';
import Input from '../elements/Input';
import Label from '../elements/Label';
import Checkbox from '../elements/Checkbox';
import InputGroup from '../elements/InputGroup';
import FormError from '../blocks/FormError';
import Button from '../elements/Button';
import Loader from '../blocks/Loader';
import Modal from '../blocks/Modal';
import { ServiceProviderValueContext } from '../../contexts/ServiceProviderContext';
import handleErrors from "../../helpers/handleErrors";
import { APP_API_BASE_URL } from "../../constants";
import TableContent from '../blocks/TableContent.js';

const Td = styled.td`
  padding: 0.5rem 0;
  &:first-child {
    font-weight: 500;
    padding-right: 1.5rem;
    vertical-align: top;
  }
  & ul {
    margin: 0;
    padding-left: 1.25rem;
  }
`;

const SettingsForm = () => {
  const history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);
  const refreshMsTeamsData = useContext(ShowMsTeamsDispatchContext);
  const currentServiceProvider = useContext(ServiceProviderValueContext);

  // Refs
  const refEnableMsTeams = useRef(null);
  const refSbcDomainName = useRef(null);
  const refServiceProviderName = useRef(null);

  // Form inputs
  const [enableMsTeams, setEnableMsTeams] = useState(false);
  const [sbcDomainName, setSbcDomainName] = useState('');
  const [serviceProviderName, setServiceProviderName] = useState('');

  // For when user has data in sbcDomainName and then taps the checkbox to disable MsTeams
  const [savedSbcDomainName, setSavedSbcDomainName] = useState('');

  // Invalid form inputs
  const [invalidEnableMsTeams, setInvalidEnableMsTeams] = useState(false);
  const [invalidSbcDomainName, setInvalidSbcDomainName] = useState(false);
  const [invalidServiceProviderName, setInvalidServiceProviderName] = useState(false);

  const [showLoader, setShowLoader] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [serviceProviderSid, setServiceProviderSid] = useState('');
  const [serviceProviders, setServiceProviders] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const getSettingsData = async () => {
      try {
        if (!localStorage.getItem('token')) {
          history.push('/');
          dispatch({
            type: 'ADD',
            level: 'error',
            message: 'You must log in to view that page.',
          });
          return;
        }

        const serviceProvidersResponse = await axios({
          method: 'get',
          baseURL: APP_API_BASE_URL,
          url: `/ServiceProviders`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const sps = serviceProvidersResponse.data;
        const sp = sps.find(s => s.service_provider_sid === currentServiceProvider);

        setServiceProviders(sps);
        setServiceProviderName(sp.name || '');
        setServiceProviderSid(sp.service_provider_sid || '');
        setEnableMsTeams(sp.ms_teams_fqdn ? true : false);
        setSbcDomainName(sp.ms_teams_fqdn || '');
      } catch (err) {
        handleErrors({ err, history, dispatch });
      } finally {
        setShowLoader(false);
      }
    };

    if (currentServiceProvider) {
      getSettingsData();
    }
    // eslint-disable-next-line
  }, [currentServiceProvider]);

  const toggleMsTeams = (e) => {
    if (!e.target.checked && sbcDomainName) {
      setSavedSbcDomainName(sbcDomainName);
      setSbcDomainName('');
    }
    if (e.target.checked && savedSbcDomainName) {
      setSbcDomainName(savedSbcDomainName);
      setSavedSbcDomainName('');
    }
    setEnableMsTeams(e.target.checked);
  };

  const handleDelete = () => {
    setErrorMessage('');

    axios({
      method: 'delete',
      baseURL: APP_API_BASE_URL,
      url: `/ServiceProviders/${serviceProviderSid}`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(() => {
        setConfirmDelete(false);
        setErrorMessage('');
        history.push('/internal/accounts');
        dispatch({
          type: 'ADD',
          level: 'success',
          message: 'Service Provider Deleted'
        });
      })
      .catch((error) => {
        setErrorMessage(error.response.data.msg);
      });
  };

  const handleSubmit = async (e) => {
    let isMounted = true;
    try {
      //=============================================================================
      // reset
      //=============================================================================
      setShowLoader(true);
      e.preventDefault();
      setErrorMessage('');
      setInvalidEnableMsTeams(false);
      setInvalidSbcDomainName(false);
      setInvalidServiceProviderName(false);
      let errorMessages = [];
      let focusHasBeenSet = false;

      //=============================================================================
      // data checks
      //=============================================================================
      if (!serviceProviderName.trim()) {
        errorMessages.push(
          'Please enter a Service Provider Name.'
        );
        setInvalidServiceProviderName(true);
        if (!focusHasBeenSet) {
          refServiceProviderName.current.focus();
          focusHasBeenSet = true;
        }
      }
      if (enableMsTeams && !sbcDomainName) {
        errorMessages.push(
          'You must provide an SBC Domain Name in order to enable Microsoft Teams Direct Routing'
        );
        setInvalidSbcDomainName(true);
        if (!focusHasBeenSet) {
          refSbcDomainName.current.focus();
          focusHasBeenSet = true;
        }
      }

      if (!enableMsTeams && sbcDomainName) {
        errorMessages.push(
          'You must check "Enable Microsoft Teams Direct Routing" to enable this feature, or remove the SBC Domain Name provided'
        );
        setInvalidEnableMsTeams(true);
        if (!focusHasBeenSet) {
          refEnableMsTeams.current.focus();
          focusHasBeenSet = true;
        }
      }

      if (errorMessages.length > 1) {
        setErrorMessage(errorMessages);
        return;
      } else if (errorMessages.length === 1) {
        setErrorMessage(errorMessages[0]);
        return;
      }

      //=============================================================================
      // submit data
      //=============================================================================
      const data = {
        ms_teams_fqdn: sbcDomainName.trim() || null,
        name: serviceProviderName.trim(),
      };

      await axios({
        method: 'put',
        baseURL: APP_API_BASE_URL,
        url: `/ServiceProviders/${serviceProviderSid}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        data,
      });

      refreshMsTeamsData();

      //=============================================================================
      // redirect
      //=============================================================================
      isMounted = false;
      history.push('/internal/accounts');
      dispatch({
        type: 'ADD',
        level: 'success',
        message: 'Settings updated'
      });

    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.clear();
        isMounted = false;
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'Your session has expired. Please log in and try again.',
        });
      } else {
        setErrorMessage((err.response && err.response.data && err.response.data.msg) || 'Something went wrong, please try again.');
        console.log(err.response || err);
      }
    } finally {
      if (isMounted) {
        setShowLoader(false);
      }
    }
  };

  //=============================================================================
  // Get API keys
  //=============================================================================
  const getApiKeys = async () => {
    try {
      if (!localStorage.getItem('token')) {
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'You must log in to view that page.',
        });
        return;
      }
      const results = await axios({
        method: 'get',
        baseURL: APP_API_BASE_URL,
        url: `/ServiceProviders/${serviceProviderSid}/ApiKeys`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const simplifiedApiKeys = results.data.map(a => {
        const { token } = a;
        const maskLength = token.length - 4;
        const maskedPortion = token.substring(0, maskLength).replace(/[a-zA-Z0-9]/g, '*');
        const revealedPortion = token.substring(maskLength);
        const maskedToken = `${maskedPortion}${revealedPortion}`;

        const { last_used } = a;
        let lastUsedString = 'Never used';
        if (last_used) {
          const currentDate = new Date();
          const lastUsedDate = new Date(last_used);
          currentDate.setHours(0, 0, 0, 0);
          lastUsedDate.setHours(0, 0, 0, 0);
          const daysDifference = Math.round((currentDate - lastUsedDate) / 1000 / 60 / 60 / 24);
          lastUsedString = daysDifference > 1
            ? `${daysDifference} days ago`
            : daysDifference === 1
              ? 'Yesterday'
              : daysDifference === 0
                ? 'Today'
                : 'Never used';
        }

        return {
          sid: a.api_key_sid,
          token: {
            type: 'masked',
            masked: maskedToken,
            revealed: token,
          },
          last_used: {
            type: 'normal',
            content: lastUsedString,
          },
        };
      });
      return (simplifiedApiKeys);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.clear();
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'Your session has expired. Please log in and try again.',
        });
      } else {
        console.log(err.response || err);
        dispatch({
          type: 'ADD',
          level: 'error',
          message: (err.response && err.response.data && err.response.data.msg) || 'Unable to get API key data',
        });
      }
    }
  };

  //=============================================================================
  // Create API key
  //=============================================================================
  const createApiKey = async () => {
    try {
      if (!localStorage.getItem('token')) {
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'You must log in to view that page.',
        });
        return;
      }
      const result = await axios({
        method: 'post',
        baseURL: APP_API_BASE_URL,
        url: '/ApiKeys',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        data: {
          "service_provider_sid": serviceProviderSid,
        }
      });
      return result.data.token;
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.clear();
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'Your session has expired. Please log in and try again.',
        });
      } else {
        console.log(err.response || err);
        dispatch({
          type: 'ADD',
          level: 'error',
          message: (err.response && err.response.data && err.response.data.msg) || 'Unable to create API key',
        });
        return 'error';
      }
    }
  };

  //=============================================================================
  // Delete API key
  //=============================================================================
  const formatApiKeyToDelete = apiKey => {
    const items = [
      { name: 'API Key:', content: apiKey.token.masked || '[none]' },
      { name: 'Last Used:', content: apiKey.last_used.content || 'Never used' },
    ];
    return items;
  };
  const deleteApiKey = async apiKeyToDelete => {
    try {
      if (!localStorage.getItem('token')) {
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'You must log in to view that page.',
        });
        return;
      }
      await axios({
        method: 'delete',
        baseURL: APP_API_BASE_URL,
        url: `/Apikeys/${apiKeyToDelete.sid}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return 'success';
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.clear();
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'Your session has expired. Please log in and try again.',
        });
      } else {
        console.log(err.response || err);
        return ((err.response && err.response.data && err.response.data.msg) || 'Unable to delete API key');
      }
    }
  };

  return (
    showLoader
      ? <Loader height="365px" />
      : (
        <>
          <Form
            large
            wideLabel
            onSubmit={handleSubmit}
          >
            <Label htmlFor="serviceProviderName">Service Provider Name</Label>
            <Input
              name="serviceProviderName"
              id="serviceProviderName"
              value={serviceProviderName}
              onChange={e => setServiceProviderName(e.target.value)}
              invalid={invalidServiceProviderName}
              ref={refServiceProviderName}
            />
            <div>{/* needed for CSS grid layout */}</div>
            <Checkbox
              noLeftMargin
              id="enableMsTeams"
              label="Enable Microsoft Teams Direct Routing"
              checked={enableMsTeams}
              onChange={toggleMsTeams}
              invalid={invalidEnableMsTeams}
              ref={refEnableMsTeams}
            />

            <Label htmlFor="sbcDomainName">SBC Domain Name</Label>
            <Input
              name="sbcDomainName"
              id="sbcDomainName"
              value={sbcDomainName}
              onChange={e => setSbcDomainName(e.target.value)}
              placeholder="Fully qualified domain name used for Microsoft Teams"
              invalid={invalidSbcDomainName}
              autoFocus={enableMsTeams}
              ref={refSbcDomainName}
              disabled={!enableMsTeams}
              title={(!enableMsTeams && "You must enable Microsoft Teams Direct Routing in order to provide an SBC Domain Name") || ""}
            />

            {errorMessage && !confirmDelete && (
              <FormError grid message={errorMessage} />
            )}

            <InputGroup flexEnd spaced>
              <Button
                grid
                gray
                type="button"
                onClick={() => {
                  history.push('/internal/accounts');
                  dispatch({
                    type: 'ADD',
                    level: 'info',
                    message: 'Changes canceled',
                  });
                }}
              >
                Cancel
              </Button>
              {serviceProviders.length > 1 && (
                <Button
                  grid
                  gray
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete
                </Button>
              )}
              <Button grid>Save</Button>
            </InputGroup>
          </Form>

          {confirmDelete && serviceProviders.length > 1 && (
            <Modal
              title="Are you sure you want to delete the Service Provider?"
              loader={false}
              content={
                <div>
                  <table>
                    <tbody>
                      <tr>
                        <Td>Service Provider Name:</Td>
                        <Td>{serviceProviderName}</Td>
                      </tr>
                      <tr>
                        <Td>SBC Domain Name:</Td>
                        <Td>{sbcDomainName || '[none]'}</Td>
                      </tr>
                    </tbody>
                  </table>
                  {errorMessage && (
                    <FormError message={errorMessage} />
                  )}
                </div>
              }
              handleCancel={() => {
                setConfirmDelete(false);
                setErrorMessage('');
              }}
              handleSubmit={handleDelete}
              actionText="Delete"
            />
          )}

          <TableContent
            name="API key"
            getContent={getApiKeys}
            columns={[
              { header: 'API Key', key: 'token', width: '27rem', fontWeight: 'normal' },
              { header: 'Last Used', key: 'last_used', width: '10rem' },
            ]}
            addContent={createApiKey}
            formatContentToDelete={formatApiKeyToDelete}
            deleteContent={deleteApiKey}
            rowsHaveDeleteButtons
          />
        </>
      )
  );
};

export default SettingsForm;
