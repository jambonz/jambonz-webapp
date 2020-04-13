import React, { useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { NotificationDispatchContext } from '../../contexts/NotificationContext';
import SetupTemplate from '../../templates/SetupTemplate';
import Form from '../../elements/Form';
import Input from '../../elements/Input';
import Label from '../../elements/Label';
import Select from '../../elements/Select';
import InputGroup from '../../elements/InputGroup';
import PasswordInput from '../../elements/PasswordInput';
import FormError from '../../blocks/FormError';
import Button from '../../elements/Button';
import SpeechSynthesisLanguageGoogle from '../../data/SpeechSynthesisLanguageGoogle';
import SpeechSynthesisLanguageAws from '../../data/SpeechSynthesisLanguageAws';
import SpeechRecognizerLanguageGoogle from '../../data/SpeechRecognizerLanguageGoogle';

const CreateApplication = () => {
  let history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);

  // Refs
  const refCallWebhook = useRef(null);
  const refCallWebhookUser = useRef(null);
  const refCallWebhookPass = useRef(null);
  const refStatusWebhook = useRef(null);
  const refStatusWebhookUser = useRef(null);
  const refStatusWebhookPass = useRef(null);

  // Form inputs
  const [ callWebhook,              setCallWebhook              ] = useState('');
  const [ callWebhookMethod,        setCallWebhookMethod        ] = useState('POST');
  const [ callWebhookUser,          setCallWebhookUser          ] = useState('');
  const [ callWebhookPass,          setCallWebhookPass          ] = useState('');
  const [ statusWebhook,            setStatusWebhook            ] = useState('');
  const [ statusWebhookMethod,      setStatusWebhookMethod      ] = useState('POST');
  const [ statusWebhookUser,        setStatusWebhookUser        ] = useState('');
  const [ statusWebhookPass,        setStatusWebhookPass        ] = useState('');
  const [ speechSynthesisVendor,    setSpeechSynthesisVendor    ] = useState('google');
  const [ speechSynthesisLanguage,  setSpeechSynthesisLanguage  ] = useState('en-US');
  const [ speechSynthesisVoice,     setSpeechSynthesisVoice     ] = useState('en-US-Standard-C');
  const [ speechRecognizerVendor,   setSpeechRecognizerVendor   ] = useState('google');
  const [ speechRecognizerLanguage, setSpeechRecognizerLanguage ] = useState('en-US');

  // Invalid form inputs
  const [ invalidCallWebhook,       setInvalidCallWebhook       ] = useState(false);
  const [ invalidCallWebhookUser,   setInvalidCallWebhookUser   ] = useState(false);
  const [ invalidCallWebhookPass,   setInvalidCallWebhookPass   ] = useState(false);
  const [ invalidStatusWebhook,     setInvalidStatusWebhook     ] = useState(false);
  const [ invalidStatusWebhookUser, setInvalidStatusWebhookUser ] = useState(false);
  const [ invalidStatusWebhookPass, setInvalidStatusWebhookPass ] = useState(false);

  const [ errorMessage, setErrorMessage ] = useState('');

  const [ showCallAuth, setShowCallAuth ] = useState(false);
  const toggleCallAuth = () => setShowCallAuth(!showCallAuth);

  const [ showStatusAuth, setShowStatusAuth ] = useState(false);
  const toggleStatusAuth = () => setShowStatusAuth(!showStatusAuth);

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

  const handleSumit = async (e) => {
    try {
      e.preventDefault();
      setErrorMessage('');
      setInvalidCallWebhook(false);
      setInvalidCallWebhookUser(false);
      setInvalidCallWebhookPass(false);
      setInvalidStatusWebhook(false);
      setInvalidStatusWebhookUser(false);
      setInvalidStatusWebhookPass(false);
      let errorMessages = [];
      let focusHasBeenSet = false;

      if (!callWebhook) {
        errorMessages.push('Please enter a Calling Webhook.');
        setInvalidCallWebhook(true);
        if (!focusHasBeenSet) {
          refCallWebhook.current.focus();
          focusHasBeenSet = true;
        }
      }

      if (!statusWebhook) {
        errorMessages.push('Please enter a Call Status Webhook.');
        setInvalidStatusWebhook(true);
        if (!focusHasBeenSet) {
          refStatusWebhook.current.focus();
          focusHasBeenSet = true;
        }
      }

      if ((callWebhookUser && !callWebhookPass) || (!callWebhookUser && callWebhookPass)) {
        errorMessages.push('Calling Webhook username and password must be either both filled out or both empty.');
        setInvalidCallWebhookUser(true);
        setInvalidCallWebhookPass(true);
        if (!focusHasBeenSet) {
          if (!callWebhookUser) {
            refCallWebhookUser.current.focus();
          } else {
            refCallWebhookPass.current.focus();
          }
          focusHasBeenSet = true;
        }
      }

      if ((statusWebhookUser && !statusWebhookPass) || (!statusWebhookUser && statusWebhookPass)) {
        errorMessages.push('Call Status Webhook username and password must be either both filled out or both empty.');
        setInvalidStatusWebhookUser(true);
        setInvalidStatusWebhookPass(true);
        if (!focusHasBeenSet) {
          if (!statusWebhookUser) {
            refStatusWebhookUser.current.focus();
          } else {
            refStatusWebhookPass.current.focus();
          }
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

      // Get Account SID in order to assign new application to it
      const account = await axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: '/Accounts',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const { account_sid } = account.data[0];

      await axios({
        method: 'post',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: `/Applications`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        data: {
          account_sid,
          name: "default application",
          call_hook: {
            url: callWebhook,
            method: callWebhookMethod,
            username: callWebhookUser || null,
            password: callWebhookPass || null,
          },
          call_status_hook: {
            url: statusWebhook,
            method: statusWebhookMethod,
            username: statusWebhookUser || null,
            password: statusWebhookPass || null,
          },
          speech_synthesis_vendor:    speechSynthesisVendor,
          speech_synthesis_language:  speechSynthesisLanguage,
          speech_synthesis_voice:     speechSynthesisVoice,
          speech_recognizer_vendor:   speechRecognizerVendor,
          speech_recognizer_language: speechRecognizerLanguage,
        },
      });

      history.push('/configure-sip-trunk');

    } catch (err) {
      if (err.response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.clear();
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'Your session has expired. Please log in and try again',
        });
      } else {
        setErrorMessage('Something went wrong, please try again');
      }
    }
  };

  return (
    <SetupTemplate
      title="Create Application"
      progress={2}
    >
      <Form
        large
        onSubmit={handleSumit}
      >
        <Label htmlFor="callWebhook">Calling Webhook</Label>
        <InputGroup>
          <Input
            large
            name="callWebhook"
            id="callWebhook"
            value={callWebhook}
            onChange={e => setCallWebhook(e.target.value)}
            placeholder="URL for your web application that will handle calls"
            invalid={invalidCallWebhook}
            ref={refCallWebhook}
            autoFocus
          />

          <Label
            middle
            htmlFor="callWebhookMethod"
          >
            Method
          </Label>
          <Select
            large
            name="callWebhookMethod"
            id="callWebhookMethod"
            value={callWebhookMethod}
            onChange={e => setCallWebhookMethod(e.target.value)}
          >
            <option value="POST">POST</option>
            <option value="GET">GET</option>
          </Select>
        </InputGroup>

        {showCallAuth ? (
          <InputGroup>
            <Label indented htmlFor="callWebhookUser">User</Label>
            <Input
              large
              name="callWebhookUser"
              id="callWebhookUser"
              value={callWebhookUser}
              onChange={e => setCallWebhookUser(e.target.value)}
              invalid={invalidCallWebhookUser}
              ref={refCallWebhookUser}
            />
            <Label htmlFor="callWebhookPass" middle>Password</Label>
            <PasswordInput
              large
              allowShowPassword
              name="callWebhookPass"
              id="callWebhookPass"
              password={callWebhookPass}
              setPassword={setCallWebhookPass}
              setErrorMessage={setErrorMessage}
              invalid={invalidCallWebhookPass}
              ref={refCallWebhookPass}
            />
          </InputGroup>
        ) : (
          <Button
            text
            formLink
            type="button"
            onClick={toggleCallAuth}
          >
            Use HTTP Basic Authentication
          </Button>
        )}

        <hr />

        <Label htmlFor="statusWebhook">Call Status Webhook</Label>
        <InputGroup>
          <Input
            large
            name="statusWebhook"
            id="statusWebhook"
            value={statusWebhook}
            onChange={e => setStatusWebhook(e.target.value)}
            placeholder="URL for your web application that will receive call status"
            invalid={invalidStatusWebhook}
            ref={refStatusWebhook}
          />

          <Label
            middle
            htmlFor="statusWebhookMethod"
          >
            Method
          </Label>
          <Select
            large
            name="statusWebhookMethod"
            id="statusWebhookMethod"
            value={statusWebhookMethod}
            onChange={e => setStatusWebhookMethod(e.target.value)}
          >
            <option value="POST">POST</option>
            <option value="GET">GET</option>
          </Select>
        </InputGroup>

        {showStatusAuth ? (
          <InputGroup>
            <Label indented htmlFor="statusWebhookUser">User</Label>
            <Input
              large
              name="statusWebhookUser"
              id="statusWebhookUser"
              value={statusWebhookUser}
              onChange={e => setStatusWebhookUser(e.target.value)}
              invalid={invalidStatusWebhookUser}
              ref={refStatusWebhookUser}
            />
            <Label htmlFor="statusWebhookPass" middle>Password</Label>
            <PasswordInput
              large
              allowShowPassword
              name="statusWebhookPass"
              id="statusWebhookPass"
              password={statusWebhookPass}
              setPassword={setStatusWebhookPass}
              setErrorMessage={setErrorMessage}
              invalid={invalidStatusWebhookPass}
              ref={refStatusWebhookPass}
            />
          </InputGroup>
        ) : (
          <Button
            text
            formLink
            type="button"
            onClick={toggleStatusAuth}
          >
            Use HTTP Basic Authentication
          </Button>
        )}

        <hr />

        <Label htmlFor="speechSynthesisVendor">Speech Synthesis Vendor</Label>
        <InputGroup>
          <Select
            name="speechSynthesisVendor"
            id="speechSynthesisVendor"
            value={speechSynthesisVendor}
            onChange={e => {
              setSpeechSynthesisVendor(e.target.value);

              // When using Google and en-US, ensure "Standard-C" is used as default
              if (
                e.target.value === 'google' &&
                speechSynthesisLanguage === 'en-US'
              ) {
                setSpeechSynthesisVoice('en-US-Standard-C');
                return;
              }

              // Google and AWS have different voice lists. See if the newly
              // chosen vendor has the same language as what was already in use.
              let newLang = e.target.value === 'google'
                ? SpeechSynthesisLanguageGoogle.find(l => (
                    l.code === speechSynthesisLanguage
                  ))
                : SpeechSynthesisLanguageAws.find(l => (
                    l.code === speechSynthesisLanguage
                  ));

              // if not, use en-US as fallback.
              if (!newLang) {
                setSpeechSynthesisLanguage('en-US');

                if (e.target.value === 'google') {
                  setSpeechSynthesisVoice('en-US-Standard-C');
                  return;
                }

                newLang = SpeechSynthesisLanguageAws.find(l => (
                  l.code === 'en-US'
                ));
              }

              // Update state to reflect first voice option for language
              setSpeechSynthesisVoice(newLang.voices[0].value);
            }}
          >
            <option value="google">Google</option>
            <option value="aws">AWS</option>
          </Select>
          <Label middle htmlFor="speechSynthesisLanguage">Language</Label>
          <Select
            name="speechSynthesisLanguage"
            id="speechSynthesisLanguage"
            value={speechSynthesisLanguage}
            onChange={e => {
              setSpeechSynthesisLanguage(e.target.value);

              // When using Google and en-US, ensure "Standard-C" is used as default
              if (
                (speechSynthesisVendor === 'google')
                && (e.target.value === 'en-US')
              ) {
                setSpeechSynthesisVoice('en-US-Standard-C');
                return;
              }

              const newLang = speechSynthesisVendor === 'google'
                ? SpeechSynthesisLanguageGoogle.find(l => (
                    l.code === e.target.value
                  ))
                : SpeechSynthesisLanguageAws.find(l => (
                    l.code === e.target.value
                  ));

              setSpeechSynthesisVoice(newLang.voices[0].value);

            }}
          >
            {speechSynthesisVendor === 'google' ? (
              SpeechSynthesisLanguageGoogle.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))
            ) : (
              SpeechSynthesisLanguageAws.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))
            )}
          </Select>
          <Label middle htmlFor="speechSynthesisVoice">Voice</Label>
          <Select
            name="speechSynthesisVoice"
            id="speechSynthesisVoice"
            value={speechSynthesisVoice}
            onChange={e => setSpeechSynthesisVoice(e.target.value)}
          >
            {speechSynthesisVendor === 'google' ? (
              SpeechSynthesisLanguageGoogle
                .filter(l => l.code === speechSynthesisLanguage)
                .map(m => m.voices.map(v => (
                    <option key={v.value} value={v.value}>{v.name}</option>
                )))
            ) : (
              SpeechSynthesisLanguageAws
                  .filter(l => l.code === speechSynthesisLanguage)
                  .map(m => m.voices.map(v => (
                      <option key={v.value} value={v.value}>{v.name}</option>
                  )))
            )}
          </Select>
        </InputGroup>

        <hr />

        <Label htmlFor="speechRecognizerVendor">Speech Recognizer Vendor</Label>
        <InputGroup>
          <Select
            name="speechRecognizerVendor"
            id="speechRecognizerVendor"
            value={speechRecognizerVendor}
            onChange={e => setSpeechRecognizerVendor(e.target.value)}
          >
            <option value="google">Google</option>
          </Select>
          <Label middle htmlFor="speechRecognizerLanguage">Language</Label>
          <Select
            name="speechRecognizerLanguage"
            id="speechRecognizerLanguage"
            value={speechRecognizerLanguage}
            onChange={e => setSpeechRecognizerLanguage(e.target.value)}
          >
            {SpeechRecognizerLanguageGoogle.map(l => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </Select>
        </InputGroup>

        {errorMessage && (
          <FormError grid message={errorMessage} />
        )}
        <Button large grid fullWidth>
          Save and Continue
        </Button>
      </Form>
    </SetupTemplate>
  );
};

export default CreateApplication;
