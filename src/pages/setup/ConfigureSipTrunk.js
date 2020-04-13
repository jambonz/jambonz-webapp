import React, { useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { NotificationDispatchContext } from '../../contexts/NotificationContext';
import SetupTemplate from '../../templates/SetupTemplate';
import Form from '../../elements/Form';
import Input from '../../elements/Input';
import Label from '../../elements/Label';
import Checkbox from '../../elements/Checkbox';
import InputGroup from '../../elements/InputGroup';
import FormError from '../../blocks/FormError';
import Button from '../../elements/Button';
import TrashButton from '../../elements/TrashButton';

const ConfigureSipTrunk = () => {
  const history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);

  // Refs
  const refName = useRef(null);
  const refIp = useRef([]);
  const refPort = useRef([]);
  const refInbound = useRef([]);
  const refOutbound = useRef([]);
  const refTrash = useRef([]);
  const refAdd = useRef(null);

  // Form inputs
  const [ name,        setName        ] = useState('');
  const [ nameInvalid, setNameInvalid ] = useState(false);
  const [ description, setDescription ] = useState('');
  const [ sipGateways, setSipGateways ] = useState([
    {
      ip: '',
      port: '',
      inbound: true,
      outbound: true,
      invalidIp: false,
      invalidPort: false,
      invalidInbound: false,
      invalidOutbound: false,
    }
  ]);

  const [ errorMessage, setErrorMessage ] = useState('');

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

  const addSipGateway = () => {
    const newSipGateways = [
      ...sipGateways,
      {
        ip: '',
        port: '',
        inbound: true,
        outbound: true,
        invalidIp: false,
        invalidPort: false,
        invalidInbound: false,
        invalidOutbound: false,
      }
    ];
    setSipGateways(newSipGateways);
  };

  const removeSipGateway = index => {
    const newSipGateways = sipGateways.filter((s,i) => i !== index);
    setSipGateways(newSipGateways);
    setErrorMessage('');
  };

  const updateSipGateways = (e, i, key) => {
    const newSipGateways = [...sipGateways];
    const newValue =
      key === 'invalidIp'       ||
      key === 'invalidPort'     ||
      key === 'invalidInbound'  ||
      key === 'invalidOutbound'
        ? true
        : (key === 'inbound') || (key === 'outbound')
          ? e.target.checked
          : e.target.value;
    newSipGateways[i][key] = newValue;
    setSipGateways(newSipGateways);
  };

  const resetInvalidFields = () => {
    setNameInvalid(false);
    const newSipGateways = [...sipGateways];
    newSipGateways.forEach((s, i) => {
      newSipGateways[i].invalidIp = false;
      newSipGateways[i].invalidPort = false;
      newSipGateways[i].invalidInbound = false;
      newSipGateways[i].invalidOutbound = false;
    });
    setSipGateways(newSipGateways);
  };

  const handleSumit = async e => {
    try {
      e.preventDefault();
      setErrorMessage('');
      resetInvalidFields();
      let errorMessages = [];
      let focusHasBeenSet = false;

      if (!name) {
        errorMessages.push('Please enter a name for this SIP Trunk.');
        setNameInvalid(true);
        if (!focusHasBeenSet) {
          refName.current.focus();
          focusHasBeenSet = true;
        }
      }

      if (!sipGateways.length) {
        errorMessages.push('You must provide at least one SIP Gateway.');
        if (!focusHasBeenSet) {
          refAdd.current.focus();
          focusHasBeenSet = true;
        }
      }

      const regIp = /^((25[0-5]|2[0-4][0-9]|[0-1]?[0-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|[0-1]?[0-9]?[0-9])$/;
      const regFqdn = /^([a-zA-Z][^.]*)(\.[^.]+){2,}$/;
      const regFqdnTopLevel = /^([a-zA-Z][^.]*)(\.[^.]+)$/;
      const regPort = /^[0-9]+$/;

      sipGateways.forEach(async (gateway, i) => {
        //-----------------------------------------------------------------------------
        // IP validation
        //-----------------------------------------------------------------------------
        const type = regIp.test(gateway.ip)
          ? 'ip'
          : regFqdn.test(gateway.ip)
            ? 'fqdn'
            : regFqdnTopLevel.test(gateway.ip)
              ? 'fqdn-top-level'
              : 'invalid';

        if (!gateway.ip) {
          errorMessages.push('The IP Address cannot be blank. Please provide an IP address or delete the row.');
          updateSipGateways(null, i, 'invalidIp');
          if (!focusHasBeenSet) {
            refIp.current[i].focus();
            focusHasBeenSet = true;
          }
        }

        else if (type === 'fqdn-top-level') {
          errorMessages.push('When using an FQDN, you must use a subdomain (e.g. sip.example.com).');
          updateSipGateways(null, i, 'invalidIp');
          if (!focusHasBeenSet) {
            refIp.current[i].focus();
            focusHasBeenSet = true;
          }
        }

        else if (type === 'invalid') {
          errorMessages.push('Please provide a valid IP address or fully qualified domain name.');
          updateSipGateways(null, i, 'invalidIp');
          if (!focusHasBeenSet) {
            refIp.current[i].focus();
            focusHasBeenSet = true;
          }
        }

        //-----------------------------------------------------------------------------
        // Port validation
        //-----------------------------------------------------------------------------
        if (
          gateway.port && (
            !(regPort.test(gateway.port))
            || (parseInt(gateway.port) < 0)
            || (parseInt(gateway.port) > 65535)
          )
        ) {
          errorMessages.push('Please provide a valid port number between 0 and 65535');
          updateSipGateways(null, i, 'invalidPort');
          if (!focusHasBeenSet) {
            refPort.current[i].focus();
            focusHasBeenSet = true;
          }
        }

        //-----------------------------------------------------------------------------
        // inbound/outbound validation
        //-----------------------------------------------------------------------------
        if (type === 'fqdn' && (!gateway.outbound || gateway.inbound)) {
          errorMessages.push('A fully qualified domain name may only be used for outbound calls.');
          updateSipGateways(null, i, 'invalidIp');
          if (gateway.inbound) updateSipGateways(null, i, 'invalidInbound');
          if (!gateway.outbound) updateSipGateways(null, i, 'invalidOutbound');
          if (!focusHasBeenSet) {
            if (gateway.inbound) {
              refInbound.current[i].focus();
            } else {
              refOutbound.current[i].focus();
            }
            focusHasBeenSet = true;
          }
        }

        else if (!gateway.inbound && !gateway.outbound) {
          errorMessages.push('Each SIP Gateway must accept inbound calls, outbound calls, or both.');
          updateSipGateways(null, i, 'invalidInbound');
          updateSipGateways(null, i, 'invalidOutbound');
          if (!focusHasBeenSet) {
            refInbound.current[i].focus();
            focusHasBeenSet = true;
          }
        }

        //-----------------------------------------------------------------------------
        // duplicates validation
        //-----------------------------------------------------------------------------
        sipGateways.forEach((otherGateway, j) => {
          if (i >= j) return;
          if (!gateway.ip) return;
          if (type === 'invalid') return;
          if (gateway.ip === otherGateway.ip && gateway.port === otherGateway.port) {
            errorMessages.push('Each row must have a unique IP/Port combination. Please delete the duplicate row.');
            updateSipGateways(null, i, 'invalidIp');
            updateSipGateways(null, i, 'invalidPort');
            updateSipGateways(null, j, 'invalidIp');
            updateSipGateways(null, j, 'invalidPort');
            if (!focusHasBeenSet) {
              refTrash.current[j].focus();
              focusHasBeenSet = true;
            }
          }
        });
      });

      // remove duplicate error messages
      for (let i = 0; i < errorMessages.length; i++) {
        for (let j = 0; j < errorMessages.length; j++) {
          if (i >= j) continue;
          if (errorMessages[i] === errorMessages[j]) {
            errorMessages.splice(j, 1);
            j = j - 1;
          }
        }
      }
      if (errorMessages.length > 1) {
        setErrorMessage(errorMessages);
        return;
      } else if (errorMessages.length === 1) {
        setErrorMessage(errorMessages[0]);
        return;
      }

      // Create SIP Trunk / VoIP Carrier
      const voipCarrier = await axios({
        method: 'post',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: `/VoipCarriers`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        data: {
          name,
          description,
        },
      });

      // Create SIP Gateways
      sipGateways.forEach(async s => {
        if (!s.ip) return;
        try {
          await axios({
            method: 'post',
            baseURL: process.env.REACT_APP_API_BASE_URL,
            url: `/SipGateways`,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            data: {
              voip_carrier_sid: voipCarrier.data.sid,
              ipv4: s.ip,
              port: s.port,
              inbound: s.inbound,
              outbound: s.outbound,
            },
          });
        } catch (err) {
          setErrorMessage(err.response.data.msg || 'Something went wrong, please try again');
          console.log(err.response);
        }
      });

      history.push('/setup-complete');

    } catch(err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.clear();
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'Your session has expired. Please log in and try again',
        });
      } else {
        setErrorMessage((err.response && err.response.data.msg) || 'Something went wrong, please try again');
        console.log(err.response);
        console.log(err);
      }
    }
  };

  return (
    <SetupTemplate
      title="Configure SIP Trunk"
      progress={3}
    >
      <Form
        large
        onSubmit={handleSumit}
      >
        <Label htmlFor="name">Name</Label>
        <Input
          large
          name="name"
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="SIP trunk provider name"
          invalid={nameInvalid}
          autoFocus
          ref={refName}
        />
        <Label htmlFor="description">Description</Label>
        <Input
          large
          name="description"
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Optional"
        />
        <hr style={{ margin: '0.5rem -2rem' }} />
        <div
          style={{ whiteSpace: 'nowrap' }}
        >SIP Gateways</div>
        {
          sipGateways.length
          ? <div>{/* for CSS grid layout */}</div>
          : null
        }
        {sipGateways.map((g, i) => (
          <React.Fragment key={i}>
            <Label htmlFor={`sipGatewaysIp[${i}]`}>IP Address</Label>
            <InputGroup>
              <Input
                large
                name={`sipGatewaysIp[${i}]`}
                id={`sipGatewaysIp[${i}]`}
                value={sipGateways[i].ip}
                onChange={e => updateSipGateways(e, i, 'ip')}
                placeholder={i === 0 ? "1.2.3.4" : 'Optional'}
                invalid={sipGateways[i].invalidIp}
                ref={ref => refIp.current[i] = ref}
              />
              <Label
                middle
                htmlFor={`sipGatewaysPort[${i}]`}
              >
                Port
              </Label>
              <Input
                large
                width="5rem"
                name={`sipGatewaysPort[${i}]`}
                id={`sipGatewaysPort[${i}]`}
                value={sipGateways[i].port}
                onChange={e => updateSipGateways(e, i, 'port')}
                placeholder="5060"
                invalid={sipGateways[i].invalidPort}
                ref={ref => refPort.current[i] = ref}
              />
              <Checkbox
                id={`inbound[${i}]`}
                label="Inbound"
                tooltip="Sends us calls"
                checked={sipGateways[i].inbound}
                onChange={e => updateSipGateways(e, i, 'inbound')}
                invalid={sipGateways[i].invalidInbound}
                ref={ref => refInbound.current[i] = ref}
              />
              <Checkbox
                id={`outbound[${i}]`}
                label="Outbound"
                tooltip="Accepts calls from us"
                checked={sipGateways[i].outbound}
                onChange={e => updateSipGateways(e, i, 'outbound')}
                invalid={sipGateways[i].invalidOutbound}
                ref={ref => refOutbound.current[i] = ref}
              />
              <TrashButton
                onClick={() => removeSipGateway(i)}
                ref={ref => refTrash.current[i] = ref}
              />
            </InputGroup>
          </React.Fragment>
        ))}
        <Button
          square
          type="button"
          onClick={addSipGateway}
          ref={refAdd}
        >
          +
        </Button>
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

export default ConfigureSipTrunk;
