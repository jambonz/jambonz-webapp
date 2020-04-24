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

const PhoneNumberForm = props => {

  let history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);

  // Refs
  const refPhoneNumber = useRef(null);
  const refSipTrunk    = useRef(null);
  const refAccount     = useRef(null);

  // Form inputs
  const [ phoneNumber, setPhoneNumber ] = useState('');
  const [ sipTrunk,    setSipTrunk    ] = useState('');
  const [ account,     setAccount     ] = useState('');
  const [ application, setApplication ] = useState('');

  // Select list values
  const [ sipTrunkValues,    setSipTrunkValues    ] = useState('');
  const [ accountValues,     setAccountValues     ] = useState('');
  const [ applicationValues, setApplicationValues ] = useState('');

  // Invalid form inputs
  const [ invalidPhoneNumber, setInvalidPhoneNumber ] = useState(false);
  const [ invalidSipTrunk,    setInvalidSipTrunk    ] = useState(false);
  const [ invalidAccount,     setInvalidAccount     ] = useState(false);

  const [ phoneNumbers, setPhoneNumbers ] = useState('');
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

        const sipTrunksPromise = axios({
          method: 'get',
          baseURL: process.env.REACT_APP_API_BASE_URL,
          url: '/VoipCarriers',
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
        const phoneNumbersPromise = axios({
          method: 'get',
          baseURL: process.env.REACT_APP_API_BASE_URL,
          url: '/PhoneNumbers',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const promises = [
          sipTrunksPromise,
          accountsPromise,
          applicationsPromise,
          phoneNumbersPromise,
        ];

        const promiseAllValues = await Promise.all(promises);

        const sipTrunks       = promiseAllValues[0].data;
        const accounts        = promiseAllValues[1].data;
        const applications    = promiseAllValues[2].data;
        const phoneNumbers    = promiseAllValues[3].data;

        setSipTrunkValues(sipTrunks);
        setAccountValues(accounts);
        setApplicationValues(applications);
        setPhoneNumbers(phoneNumbers);

        if (!accounts.length) {
          dispatch({
            type: 'ADD',
            level: 'error',
            message: 'You must create an account before you can create a phone number.',
          });
        }

        if (!sipTrunks.length) {
          dispatch({
            type: 'ADD',
            level: 'error',
            message: 'You must create a SIP trunk before you can create a phone number.',
          });
        }

        if (!accounts.length) {
          history.push('/internal/accounts');
          return;
        } else if (!sipTrunks.length) {
          history.push('/internal/sip-trunks');
          return;
        }

        if (props.type === 'edit') {
          const phoneNumberData = promiseAllValues[3] && promiseAllValues[3].data.filter(p => {
            return p.phone_number_sid === props.phone_number_sid;
          });

          if (!phoneNumberData.length) {
            history.push('/internal/phone-numbers');
            dispatch({
              type: 'ADD',
              level: 'error',
              message: 'That phone number does not exist.',
            });
            return;
          }

          setPhoneNumber (( phoneNumberData[0] && phoneNumberData[0].number           ) || '');
          setSipTrunk    (( phoneNumberData[0] && phoneNumberData[0].voip_carrier_sid ) || '');
          setAccount     (( phoneNumberData[0] && phoneNumberData[0].account_sid      ) || '');
          setApplication (( phoneNumberData[0] && phoneNumberData[0].application_sid  ) || '');
        }

        if (props.type === 'add') {
          if (sipTrunks.length === 1) { setSipTrunk(sipTrunks[0].voip_carrier_sid); }
          if ( accounts.length === 1) {  setAccount( accounts[0].account_sid     ); }
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
    try {
      e.preventDefault();
      setErrorMessage('');
      setInvalidPhoneNumber(false);
      setInvalidSipTrunk(false);
      setInvalidAccount(false);
      let errorMessages = [];
      let focusHasBeenSet = false;

      if (!phoneNumber) {
        errorMessages.push('Please provide a phone number');
        setInvalidPhoneNumber(true);
        if (!focusHasBeenSet) {
          refPhoneNumber.current.focus();
          focusHasBeenSet = true;
        }
      }

      // check if phone number is already in use
      for (const num of phoneNumbers) {
        if (num.phone_number_sid === props.phone_number_sid) {
          continue;
        }

        if (num.number === phoneNumber) {
          errorMessages.push(
            'The phone number you have entered is already in use.'
          );
          setInvalidPhoneNumber(true);
          if (!focusHasBeenSet) {
            refPhoneNumber.current.focus();
            focusHasBeenSet = true;
          }
        }
      };

      if (!sipTrunk) {
        errorMessages.push('Please select a SIP trunk');
        setInvalidSipTrunk(true);
        if (!focusHasBeenSet) {
          refSipTrunk.current.focus();
          focusHasBeenSet = true;
        }
      }

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
        ? `/PhoneNumbers`
        : `/PhoneNumbers/${props.phone_number_sid}`;

      const data = {
        account_sid: account,
        application_sid: application || null,
      };

      if (props.type === 'add') {
        data.number = phoneNumber;
        data.voip_carrier_sid = sipTrunk;
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
        ? 'Phone number created successfully'
        : 'Phone number updated successfully';

      dispatch({
        type: 'ADD',
        level: 'success',
        message: dispatchMessage
      });

      history.push('/internal/phone-numbers');
    } catch (err) {
      setErrorMessage(
        (err.response && err.response.data && err.response.data.msg) ||
        'Something went wrong, please try again.'
      );
      console.log(err.response || err);
    }
  };

  return (
    showLoader
      ? <Loader height={'310px'}/>
      : <Form
          large
          onSubmit={handleSubmit}
        >
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            name="phoneNumber"
            id="phoneNumber"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            placeholder="Phone number that will be sending calls to this service"
            invalid={invalidPhoneNumber}
            autoFocus
            ref={refPhoneNumber}
            disabled={props.type === 'edit'}
          />

          <Label htmlFor="sipTrunk">SIP Trunk</Label>
          <Select
            name="sipTrunk"
            id="sipTrunk"
            value={sipTrunk}
            onChange={e => setSipTrunk(e.target.value)}
            invalid={invalidSipTrunk}
            ref={refSipTrunk}
            disabled={props.type === 'edit'}
          >
            {(
              (sipTrunkValues.length > 1) ||
              (props.type === 'edit' && sipTrunk !== sipTrunkValues[0].voip_carrier_sid)
            ) && (
              <option value="">-- Choose the SIP trunk that this phone number belongs to --</option>
            )}
            {sipTrunkValues.map(s => (
              <option
                key={s.voip_carrier_sid}
                value={s.voip_carrier_sid}
              >
                {s.name}
              </option>
            ))}
          </Select>

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
              <option value="">-- Choose the account that this phone number should be associated with --</option>
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
                ? '-- OPTIONAL: Choose the application that will receive calls from this number --'
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
                  history.push('/internal/phone-numbers');
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
                ? 'Add Phone Number'
                : 'Save'
              }
            </Button>
          </InputGroup>
        </Form>
  );
};

export default PhoneNumberForm;
