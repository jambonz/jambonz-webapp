/* eslint-disable no-undef */
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
import styled from "styled-components/macro";

import { NotificationDispatchContext } from '../../contexts/NotificationContext';
import handleErrors from '../../helpers/handleErrors';
import Form from '../elements/Form';
import Input from '../elements/Input';
import Label from '../elements/Label';
import Select from '../elements/Select';
import InputGroup from '../elements/InputGroup';
import PasswordInput from '../elements/PasswordInput';
import Radio from '../elements/Radio';
import Checkbox from '../elements/Checkbox';
import FileUpload from '../elements/FileUpload';
import Code from '../elements/Code';
import FormError from '../blocks/FormError';
import Button from '../elements/Button';
import Loader from '../blocks/Loader';
import { ServiceProviderValueContext } from '../../contexts/ServiceProviderContext';

import MicrosoftAzureRegions from '../../data/MicrosoftAzureRegions';


const StyledButtonGroup = styled(InputGroup)`
  @media (max-width: 576.98px) {
    width: 100%;

    & > *:first-child {
      width: 100%;
      flex: 1;

      & > * {
        width: 100%;
      }
    }

    & > *:last-child {
      width: 100%;
      flex: 1;

      & > * {
        width: 100%;
      }
    }
  }
  ${props => props.type === 'add' ? `
    @media (max-width: 459.98px) {
      flex-direction: column;

      & > *:first-child {
        width: 100%;
        margin: 0 0 1rem 0;
      }
    }
  ` : ''}
`;

const SpeechServicesAddEdit = (props) => {
  let history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);
  const currentServiceProvider = useContext(ServiceProviderValueContext);
  const jwt = localStorage.getItem('token');

  let { speech_service_sid } = useParams();
  const type = speech_service_sid ? 'edit' : 'add';

  // Refs
  const refVendorGoogle = useRef(null);
  const refVendorAws = useRef(null);
  const refVendorMs = useRef(null);
  const refVendorWellSaid = useRef(null);
  const refAccessKeyId = useRef(null);
  const refSecretAccessKey = useRef(null);
  const refUseForTts = useRef(null);
  const refUseForStt = useRef(null);
  const refApiKey = useRef(null);
  const refRegion = useRef(null);

  // Form inputs
  const [ vendor,              setVendor              ] = useState('');
  const [ serviceKey,          setServiceKey          ] = useState('');
  const [ displayedServiceKey, setDisplayedServiceKey ] = useState('');
  const [ accessKeyId,         setAccessKeyId         ] = useState('');
  const [ secretAccessKey,     setSecretAccessKey     ] = useState('');
  const [ useForTts,           setUseForTts           ] = useState(false);
  const [ useForStt,           setUseForStt           ] = useState(false);
  const [ accounts,            setAccounts            ] = useState([]);
  const [ accountSid,          setAccountSid          ] = useState('');
  const [ apiKey,              setApiKey              ] = useState('');
  const [ region,              setRegion              ] = useState('');

  // Invalid form inputs
  const [ invalidVendorGoogle,    setInvalidVendorGoogle    ] = useState(false);
  const [ invalidVendorAws,       setInvalidVendorAws       ] = useState(false);
  const [ invalidVendorMs,        setInvalidVendorMs        ] = useState(false);
  const [ invalidVendorWellSaid,  setInvalidVendorWellSaid  ] = useState(false);
  const [ invalidAccessKeyId,     setInvalidAccessKeyId     ] = useState(false);
  const [ invalidSecretAccessKey, setInvalidSecretAccessKey ] = useState(false);
  const [ invalidUseForTts,       setInvalidUseForTts       ] = useState(false);
  const [ invalidUseForStt,       setInvalidUseForStt       ] = useState(false);
  const [ invalidApiKey,          setInvalidApiKey          ] = useState(false);
  const [ invalidRegion,          setInvalidRegion          ] = useState(false);

  const [ originalTtsValue,       setOriginalTtsValue       ] = useState(null);
  const [ originalSttValue,       setOriginalSttValue       ] = useState(null);

  const [ validServiceKey,        setValidServiceKey        ] = useState(false);

  const [ showLoader, setShowLoader ] = useState(true);
  const [ errorMessage, setErrorMessage ] = useState('');

  useEffect(() => {
    const getAPIData = async () => {
      let isMounted = true;
      try {
        const accountsResponse = await axios({
          method: 'get',
          baseURL: APP_API_BASE_URL,
          url: '/Accounts',
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });

        setAccounts(accountsResponse.data);

        if (type === 'edit') {
          const speechCredential = await axios({
            method: 'get',
            baseURL: APP_API_BASE_URL,
            url: `/ServiceProviders/${currentServiceProvider}/SpeechCredentials/${speech_service_sid}`,
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          });

          let serviceKeyJson = '';
          let displayedServiceKeyJson = '';

          try {
            serviceKeyJson = JSON.parse(speechCredential.data.service_key);
            displayedServiceKeyJson = JSON.stringify(serviceKeyJson, null, 2);
          } catch (err) {
          }

          setAccountSid(          speechCredential.data.account_sid       || '');
          setVendor(              speechCredential.data.vendor            || undefined);
          setServiceKey(          serviceKeyJson                          || '');
          setDisplayedServiceKey( displayedServiceKeyJson                 || '');
          setAccessKeyId(         speechCredential.data.access_key_id     || '');
          setSecretAccessKey(     speechCredential.data.secret_access_key || '');
          setApiKey(              speechCredential.data.api_key           || '');
          setRegion(              speechCredential.data.region            || '');
          setUseForTts(           speechCredential.data.use_for_tts       || false);
          setUseForStt(           speechCredential.data.use_for_stt       || false);
          setOriginalTtsValue(    speechCredential.data.use_for_tts       || false);
          setOriginalSttValue(    speechCredential.data.use_for_stt       || false);
        }
        setShowLoader(false);
      } catch (err) {
        isMounted = false;
        handleErrors({
          err,
          history,
          dispatch,
          redirect: '/internal/speech-services',
          fallbackMessage: 'That speech service does not exist',
          preferFallback: true,
        });
      } finally {
        if (isMounted) {
          setShowLoader(false);
        }
      }
    };
    getAPIData();
    // eslint-disable-next-line
  }, []);

  const handleFileUpload = async (e) => {
    setErrorMessage('');
    setServiceKey('');
    setDisplayedServiceKey('');

    const file = e.target.files[0];

    if (!file) {
      setValidServiceKey(false);
      return;
    }

    const fileAsText = await file.text();

    try {
      const fileJson = JSON.parse(fileAsText);

      if (!fileJson.client_email || !fileJson.private_key) {
        setValidServiceKey(false);
        setErrorMessage('Invalid service key file, missing data.');
        return;
      }

      setValidServiceKey(true);
      setServiceKey(fileJson);
      setDisplayedServiceKey(JSON.stringify(fileJson, null, 2));

    } catch (err) {
      setValidServiceKey(false);
      setErrorMessage('Invalid service key file, could not parse as JSON.');
    }
  };

  const handleSubmit = async (e) => {
    let isMounted = true;
    try {
      setShowLoader(true);
      e.preventDefault();
      setErrorMessage('');
      setInvalidVendorGoogle(false);
      setInvalidVendorAws(false);
      setInvalidVendorMs(false);
      setInvalidVendorWellSaid(false);
      setInvalidAccessKeyId(false);
      setInvalidSecretAccessKey(false);
      setInvalidUseForTts(false);
      setInvalidUseForStt(false);
      setInvalidApiKey(false);
      let errorMessages = [];
      let focusHasBeenSet = false;

      if (!vendor) {
        errorMessages.push('Please select a vendor.');
        setInvalidVendorGoogle(true);
        setInvalidVendorAws(true);
        setInvalidVendorMs(true);
        setInvalidVendorWellSaid(true);
        if (!focusHasBeenSet) {
          refVendorGoogle.current.focus();
          focusHasBeenSet = true;
        }
      }

      if (vendor === 'google' && !serviceKey) {
        errorMessages.push('Please upload a service key file.');
      }

      if (vendor === 'aws' && !accessKeyId) {
        errorMessages.push('Please provide an access key ID.');
        setInvalidAccessKeyId(true);
        if (!focusHasBeenSet) {
          refAccessKeyId.current.focus();
          focusHasBeenSet = true;
        }
      }

      if (vendor === 'aws' && !secretAccessKey) {
        errorMessages.push('Please provide a secret access key.');
        setInvalidSecretAccessKey(true);
        if (!focusHasBeenSet) {
          refSecretAccessKey.current.focus();
          focusHasBeenSet = true;
        }
      }

      if (vendor === 'microsoft' && !apiKey) {
        errorMessages.push('Please provide an API key.');
        setInvalidApiKey(true);
        if (!focusHasBeenSet) {
          refApiKey.current.focus();
          focusHasBeenSet = true;
        }
      }

      if (vendor === 'microsoft' && !region) {
        errorMessages.push('Please select a region.');
        setInvalidRegion(true);
        if (!focusHasBeenSet) {
          refRegion.current.focus();
          focusHasBeenSet = true;
        }
      }

      if (vendor === 'wellsaid' && !apiKey) {
        errorMessages.push('Please provide an API key.');
        setInvalidApiKey(true);
        if (!focusHasBeenSet) {
          refApiKey.current.focus();
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

      //===============================================
      // Submit
      //===============================================
      const method = type === 'add'
        ? 'post'
        : 'put';

      const url = type === 'add'
        ? `/ServiceProviders/${currentServiceProvider}/SpeechCredentials`
        : `/ServiceProviders/${currentServiceProvider}/SpeechCredentials/${speech_service_sid}`;

      const postResults = await axios({
        method,
        baseURL: APP_API_BASE_URL,
        url,
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        data: {
          vendor,
          service_key: vendor === 'google' ? JSON.stringify(serviceKey) : null,
          access_key_id: vendor === 'aws' ? accessKeyId : null,
          secret_access_key: vendor === 'aws' ? secretAccessKey : null,
          api_key: ['microsoft', 'wellsaid'].includes(vendor) ? apiKey : null,
          region: vendor === 'microsoft' ? region : null,
          use_for_tts: useForTts,
          use_for_stt: useForStt,
          service_provider_sid: accountSid ? null : currentServiceProvider,
          account_sid: accountSid || null,
        }
      });

      if (type === 'add') {
        if (!postResults.data || !postResults.data.sid) {
          throw new Error('Error retrieving response data');
        }

        speech_service_sid = postResults.data.sid;
      }

      //===============================================
      // Test speech credentials
      //===============================================
      if (useForTts || useForStt) {
        const testResults = await axios({
          method: 'get',
          baseURL: APP_API_BASE_URL,
          url: `/ServiceProviders/${currentServiceProvider}/SpeechCredentials/${speech_service_sid}/test`,
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });

        if (useForTts && testResults.data.tts.status === 'not tested') {
          errorMessages.push('text-to-speech was not tested, please try again.');
        }

        if (useForStt && testResults.data.stt.status === 'not tested') {
          errorMessages.push('speech-to-text was not tested, please try again.');
        }

        const ttsReason = (useForTts && testResults.data.tts.status === 'fail')
          ? testResults.data.tts.reason
          : null;

        const sttReason = (useForStt && testResults.data.stt.status === 'fail')
          ? testResults.data.stt.reason
          : null;

        if (ttsReason && (ttsReason === sttReason)) {
          errorMessages.push(ttsReason);
        } else {
          if (ttsReason) {
            errorMessages.push(`Text-to-speech error: ${ttsReason}`);
          }

          if (sttReason) {
            errorMessages.push(`Speech-to-text error: ${sttReason}`);
          }
        }

        if (errorMessages.length > 1) {
          setErrorMessage(errorMessages);
        } else if (errorMessages.length === 1) {
          setErrorMessage(errorMessages[0]);
        }

        if (errorMessages.length) {
          if (type === 'add') {
            await axios({
              method: 'delete',
              baseURL: APP_API_BASE_URL,
              url: `/ServiceProviders/${currentServiceProvider}/SpeechCredentials/${speech_service_sid}`,
              headers: {
                Authorization: `Bearer ${jwt}`,
              },
            });
          }

          if (type === 'edit') {
            await axios({
              method,
              baseURL: APP_API_BASE_URL,
              url,
              headers: {
                Authorization: `Bearer ${jwt}`,
              },
              data: {
                use_for_tts: originalTtsValue,
                use_for_stt: originalSttValue,
              }
            });
          }

          return;
        }
      }

      //===============================================
      // If successful, go to speech services
      //===============================================
      isMounted = false;
      if (accountSid) {
        history.push(`/internal/speech-services?account_sid=${accountSid}`);
      } else {
        history.push('/internal/speech-services');
      }
      const dispatchMessage = type === 'add'
        ? 'Speech service created successfully'
        : 'Speech service updated successfully';
      dispatch({
        type: 'ADD',
        level: 'success',
        message: dispatchMessage
      });

    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.clear();
        sessionStorage.clear();
        isMounted = false;
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'Your session has expired. Please log in and try again.',
        });
      } else {
        setErrorMessage(
          (err.response && err.response.data && err.response.data.msg) ||
          err.message || 'Something went wrong, please try again.'
        );
        console.error(err.response || err);
      }
    } finally {
      if (isMounted) {
        setShowLoader(false);
      }
    }
  };

  return (
    showLoader ? (
      <Loader height={props.type === 'add' ? '424px' : '376px'}/>
    ) : (
      <Form
        large
        onSubmit={handleSubmit}
      >
        <Label htmlFor="name">Vendor</Label>
        <InputGroup>
          <Radio
            noLeftMargin
            name="vendor"
            id="google"
            label="Google"
            checked={vendor === 'google'}
            onChange={() => setVendor('google')}
            invalid={invalidVendorGoogle}
            ref={refVendorGoogle}
            disabled={type === 'edit'}
          />

          <Radio
            name="vendor"
            id="aws"
            label="Amazon Web Services"
            checked={vendor === 'aws'}
            onChange={() => setVendor('aws')}
            invalid={invalidVendorAws}
            ref={refVendorAws}
            disabled={type === 'edit'}
          />

          <Radio
            name="vendor"
            id="microsoft"
            label="Microsoft"
            checked={vendor === 'microsoft'}
            onChange={() => setVendor('microsoft')}
            invalid={invalidVendorMs}
            ref={refVendorMs}
            disabled={type === 'edit'}
          />

          <Radio
            name="vendor"
            id="wellsaid"
            label="WellSaid"
            checked={vendor === 'wellsaid'}
            onChange={() => setVendor('wellsaid')}
            invalid={invalidVendorWellSaid}
            ref={refVendorWellSaid}
            disabled={type === 'edit'}
          />
        </InputGroup>

        <Label htmlFor="account">Used by</Label>
        <Select
          name="account"
          id="account"
          value={accountSid}
          onChange={e => setAccountSid(e.target.value)}
        >
          <option value="">
            All accounts
          </option>
          {accounts.filter(a => a.service_provider_sid === currentServiceProvider).map(a => (
            <option
              key={a.account_sid}
              value={a.account_sid}
            >
              {a.name}
            </option>
          ))}
        </Select>

        {vendor === 'google' ? (
          <>
            <Label htmlFor="serviceKey">Service Key</Label>
            {type === 'add' && (
              <FileUpload
                id="serviceKey"
                onChange={handleFileUpload}
                validFile={validServiceKey}
              />
            )}
            {displayedServiceKey && (
              <>
                {type === 'add' && (
                  <span></span>
                )}
                <Code>{displayedServiceKey}</Code>
              </>
            )}
          </>
        ) : vendor === 'aws' ? (
          <>
            <Label htmlFor="accessKeyId">Access Key ID</Label>
            <Input
              name="accessKeyId"
              id="accessKeyId"
              value={accessKeyId}
              onChange={e => setAccessKeyId(e.target.value)}
              placeholder=""
              invalid={invalidAccessKeyId}
              ref={refAccessKeyId}
              disabled={type === 'edit'}
            />

            <Label htmlFor="secretAccessKey">Secret Access Key</Label>
            <PasswordInput
              allowShowPassword
              name="secretAccessKey"
              id="secretAccessKey"
              password={secretAccessKey}
              setPassword={setSecretAccessKey}
              setErrorMessage={setErrorMessage}
              invalid={invalidSecretAccessKey}
              ref={refSecretAccessKey}
              disabled={type === 'edit'}
            />
          </>
        ) : vendor === 'microsoft' ? (
          <>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              name="apiKey"
              id="apiKey"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder=""
              invalid={invalidApiKey}
              ref={refApiKey}
              disabled={type === 'edit'}
            />

            <Label htmlFor="region">Region</Label>
            <Select
              name="region"
              id="region"
              value={region}
              onChange={e => setRegion(e.target.value)}
              ref={refRegion}
              invalid={invalidRegion}
            >
              <option value="">
                All regions
              </option>
              {MicrosoftAzureRegions.map(r => (
                <option
                  key={r.value}
                  value={r.value}
                >
                  {r.name}
                </option>
              ))}
            </Select>
          </>
        ) :  vendor === 'wellsaid' ? (
          <>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              name="apiKey"
              id="apiKey"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder=""
              invalid={invalidApiKey}
              ref={refApiKey}
              disabled={type === 'edit'}
            />
          </>
        ) : (
          null
        )}

        {['google', 'aws', 'microsoft', 'wellsaid'].includes(vendor) ? (
          <>
            <div/>
            <Checkbox
              noLeftMargin
              name="useForTts"
              id="useForTts"
              label="Use for text-to-speech"
              checked={useForTts}
              onChange={e => setUseForTts(e.target.checked)}
              invalid={invalidUseForTts}
              ref={refUseForTts}
            />
            <div/>
            <Checkbox
              noLeftMargin
              name="useForStt"
              id="useForStt"
              label="Use for speech-to-text"
              disabled={'wellsaid' === vendor}
              checked={useForStt}
              onChange={e => setUseForStt(e.target.checked)}
              invalid={invalidUseForStt}
              ref={refUseForStt}
            />
          </>
        ) :
        (
          null
        )}

        {errorMessage && (
          <FormError grid message={errorMessage} />
        )}

        <StyledButtonGroup flexEnd spaced type={type}>
          <Button
            rounded="true"
            gray
            type="button"
            onClick={() => {
              history.push('/internal/speech-services');
              dispatch({
                type: 'ADD',
                level: 'info',
                message: type === 'add' ? 'New speech service canceled' :'Changes canceled',
              });
            }}
          >
            Cancel
          </Button>

          <Button rounded="true">
            {type === 'add'
              ? 'Add Speech Service'
              : 'Save'
            }
          </Button>
        </StyledButtonGroup>
      </Form>
    )
  );
};

export default SpeechServicesAddEdit;
