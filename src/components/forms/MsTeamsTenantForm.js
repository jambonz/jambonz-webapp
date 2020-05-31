import React, { useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { NotificationDispatchContext } from '../../contexts/NotificationContext';
import Form from '../elements/Form';
import Input from '../elements/Input';
import Label from '../elements/Label';
import Select from '../elements/Select';
import InputGroup from '../elements/InputGroup';
import FormError from '../blocks/FormError';
import Loader from '../blocks/Loader';
import Button from '../elements/Button';

const MsTeamsTenantForm = props => {

  let history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);

  // Refs
  const refDomainName = useRef(null);
  const refAccount    = useRef(null);

  // Form inputs
  const [ domainName,  setDomainName  ] = useState('');
  const [ account,     setAccount     ] = useState('');
  const [ application, setApplication ] = useState('');

  // Select list values
  const [ accountValues,     setAccountValues     ] = useState('');
  const [ applicationValues, setApplicationValues ] = useState('');

  // Invalid form inputs
  const [ invalidDomainName, setInvalidDomainName ] = useState(false);
  const [ invalidAccount,    setInvalidAccount    ] = useState(false);

  const [ serviceProviderSid, setServiceProviderSid ] = useState('');
  const [ tenants, setTenants ] = useState('');
  const [ showLoader, setShowLoader ] = useState(true);
  const [ errorMessage, setErrorMessage ] = useState('');

  // Check if user is logged in
  useEffect(() => {
    const getAPIData = async () => {
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

        const tenantsPromise = axios({
          method: 'get',
          baseURL: process.env.REACT_APP_API_BASE_URL,
          url: '/MicrosoftTeamsTenants',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const accountsPromise = axios({
          method: 'get',
          baseURL: process.env.REACT_APP_API_BASE_URL,
          url: '/Accounts',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const applicationsPromise = axios({
          method: 'get',
          baseURL: process.env.REACT_APP_API_BASE_URL,
          url: '/Applications',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const promises = [
          tenantsPromise,
          accountsPromise,
          applicationsPromise,
        ];

        if (props.type === 'add') {
          promises.push(axios({
            method: 'get',
            baseURL: process.env.REACT_APP_API_BASE_URL,
            url: '/ServiceProviders',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }));
        }

        const promiseAllValues = await Promise.all(promises);

        const tenants      = promiseAllValues[0].data;
        const accounts     = promiseAllValues[1].data;
        const applications = promiseAllValues[2].data;

        setTenants(tenants);
        setAccountValues(accounts);
        setApplicationValues(applications);

        if (props.type === 'add') {
          const serviceProviders = promiseAllValues[3].data;
          setServiceProviderSid(serviceProviders[0].service_provider_sid);
        }

        if (!accounts.length) {
          dispatch({
            type: 'ADD',
            level: 'error',
            message: 'You must create an account before you can create a Microsoft Teams Tenant.',
          });
          history.push('/internal/accounts');
          return;
        }

        if (props.type === 'edit') {
          const tenantData = tenants.filter(tenant => {
            return tenant.ms_teams_tenant_sid === props.ms_teams_tenant_sid;
          });

          if (!tenantData.length) {
            history.push('/internal/ms-teams-tenants');
            dispatch({
              type: 'ADD',
              level: 'error',
              message: 'That tenant does not exist.',
            });
            return;
          }

          setDomainName (( tenantData[0] && tenantData[0].tenant_fqdn    ) || '');
          setAccount    (( tenantData[0] && tenantData[0].account_sid    ) || '');
          setApplication(( tenantData[0] && tenantData[0].application_sid) || '');
        }

        if (props.type === 'add' && accounts.length === 1) {
          setAccount(accounts[0].account_sid);
        }

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
    getAPIData();
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async e => {
    let isMounted = true;
    try {
      setShowLoader(true);
      e.preventDefault();
      setErrorMessage('');
      setInvalidDomainName(false);
      setInvalidAccount(false);
      let errorMessages = [];
      let focusHasBeenSet = false;

      if (!domainName) {
        errorMessages.push('Please provide a domain name');
        setInvalidDomainName(true);
        if (!focusHasBeenSet) {
          refDomainName.current.focus();
          focusHasBeenSet = true;
        }
      }

      // check if domain name is already in use
      for (const tenant of tenants) {
        if (tenant.ms_teams_tenant_sid === props.ms_teams_tenant_sid) {
          continue;
        }

        if (tenant.tenant_fqdn === domainName) {
          errorMessages.push(
            'The domain name you have entered is already in use.'
          );
          setInvalidDomainName(true);
          if (!focusHasBeenSet) {
            refDomainName.current.focus();
            focusHasBeenSet = true;
          }
        }
      };

      if (!account) {
        errorMessages.push('Please select an account');
        setInvalidAccount(true);
        if (!focusHasBeenSet) {
          refAccount.current.focus();
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
      // Submit
      //=============================================================================
      const method = props.type === 'add'
        ? 'post'
        : 'put';

      const url = props.type === 'add'
        ? `/MicrosoftTeamsTenants`
        : `/MicrosoftTeamsTenants/${props.ms_teams_tenant_sid}`;

      const data = {
        tenant_fqdn: domainName.trim(),
        account_sid: account,
        application_sid: application || null,
      };

      if (props.type === 'add') {
        data.service_provider_sid = serviceProviderSid;
      }

      await axios({
        method,
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        data
      });

      const dispatchMessage = props.type === 'add'
        ? 'Tenant created successfully'
        : 'Tenant updated successfully';

      dispatch({
        type: 'ADD',
        level: 'success',
        message: dispatchMessage
      });

      isMounted = false;
      history.push('/internal/ms-teams-tenants');
    } catch (err) {
      setErrorMessage(
        (err.response && err.response.data && err.response.data.msg) ||
        'Something went wrong, please try again.'
      );
      console.log(err.response || err);
    } finally {
      if (isMounted) {
        setShowLoader(false);
      }
    }
  };

  return (
    showLoader
      ? <Loader height={'258px'}/>
      : <Form
          large
          onSubmit={handleSubmit}
        >
          <Label htmlFor="domainName">Domain Name</Label>
          <Input
            name="domainName"
            id="domainName"
            value={domainName}
            onChange={e => setDomainName(e.target.value)}
            placeholder="Tenant's fully qualified domain name"
            invalid={invalidDomainName}
            autoFocus
            ref={refDomainName}
          />

          <Label htmlFor="account">Account</Label>
          <Select
            name="account"
            id="account"
            value={account}
            onChange={e => setAccount(e.target.value)}
            invalid={invalidAccount}
            ref={refAccount}
          >
            {(
              (accountValues.length > 1) ||
              (props.type === 'edit' && account !== accountValues[0].account_sid)
            ) && (
              <option value="">-- Choose the account that this tenant should be associated with --</option>
            )}
            {accountValues.map(a => (
              <option
                key={a.account_sid}
                value={a.account_sid}
              >
                {a.name}
              </option>
            ))}
          </Select>

          <Label htmlFor="application">Application</Label>
          <Select
            name="application"
            id="application"
            value={application}
            onChange={e => setApplication(e.target.value)}
          >
            <option value="">
              {props.type === 'add'
                ? '-- OPTIONAL: Choose the application that this tenant should be associated with --'
                : '-- NONE --'
              }
            </option>
            {applicationValues.map(a => (
              <option
                key={a.application_sid}
                value={a.application_sid}
              >
                {a.name}
              </option>
            ))}
          </Select>

          {errorMessage && (
            <FormError grid message={errorMessage} />
          )}

          <InputGroup flexEnd spaced>
            {props.type === 'edit' && (
              <Button
                grid
                gray
                type="button"
                onClick={() => {
                  history.push('/internal/ms-teams-tenants');
                  dispatch({
                    type: 'ADD',
                    level: 'info',
                    message: 'Changes canceled',
                  });
                }}
              >
                Cancel
              </Button>
            )}

            <Button
              grid
              fullWidth={props.type === 'add'}
            >
              {props.type === 'add'
                ? 'Add Microsoft Teams Tenant'
                : 'Save'
              }
            </Button>
          </InputGroup>
        </Form>
  );
};

export default MsTeamsTenantForm;
