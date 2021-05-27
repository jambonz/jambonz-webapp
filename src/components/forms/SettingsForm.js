import React, { useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
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

const SettingsForm = () => {
  const history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);
  const refreshMsTeamsData = useContext(ShowMsTeamsDispatchContext);

  // Refs
  const refEnableMsTeams = useRef(null);
  const refSbcDomainName = useRef(null);

  // Form inputs
  const [ enableMsTeams, setEnableMsTeams ] = useState(false);
  const [ sbcDomainName, setSbcDomainName ] = useState('');

  // For when user has data in sbcDomainName and then taps the checkbox to disable MsTeams
  const [ savedSbcDomainName, setSavedSbcDomainName ] = useState('');

  // Invalid form inputs
  const [ invalidEnableMsTeams, setInvalidEnableMsTeams ] = useState(false);
  const [ invalidSbcDomainName, setInvalidSbcDomainName ] = useState(false);

  const [ showLoader, setShowLoader ] = useState(true);
  const [ errorMessage, setErrorMessage ] = useState('');

  const [ serviceProviderSid, setServiceProviderSid ] = useState('');

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
          baseURL: process.env.REACT_APP_API_BASE_URL,
          url: '/ServiceProviders',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const sp = serviceProvidersResponse.data[0];

        setServiceProviderSid(sp.service_provider_sid || '');
        setEnableMsTeams(sp.ms_teams_fqdn ? true : false);
        setSbcDomainName(sp.ms_teams_fqdn || '');

        setShowLoader(false);

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
          dispatch({
            type: 'ADD',
            level: 'error',
            message: (err.response && err.response.data && err.response.data.msg) || 'Something went wrong, please try again.',
          });
          console.log(err.response || err);
        }
        setShowLoader(false);
      }
    };
    getSettingsData();
    // eslint-disable-next-line
  }, []);

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
      let errorMessages = [];
      let focusHasBeenSet = false;

      //=============================================================================
      // data checks
      //=============================================================================
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
      };

      await axios({
        method: 'put',
        baseURL: process.env.REACT_APP_API_BASE_URL,
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

  return (
    showLoader
    ? <Loader height="365px" />
    : <Form
        large
        wideLabel
        onSubmit={handleSubmit}
      >
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

        <hr />

        {errorMessage && (
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

          <Button grid>Save</Button>
        </InputGroup>
      </Form>
  );
};

export default SettingsForm;
