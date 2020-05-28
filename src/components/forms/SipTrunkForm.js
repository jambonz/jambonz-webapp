import React, { useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { NotificationDispatchContext } from '../../contexts/NotificationContext';
import Form from '../elements/Form';
import Input from '../elements/Input';
import Label from '../elements/Label';
import Checkbox from '../elements/Checkbox';
import InputGroup from '../elements/InputGroup';
import FormError from '../blocks/FormError';
import Button from '../elements/Button';
import TrashButton from '../elements/TrashButton';
import Loader from '../blocks/Loader';
import sortSipGateways from '../../helpers/sortSipGateways';

const SipTrunkForm = props => {
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
      sip_gateway_sid: '',
      ip: '',
      port: 5060,
      inbound: true,
      outbound: true,
      invalidIp: false,
      invalidPort: false,
      invalidInbound: false,
      invalidOutbound: false,
    }
  ]);

  const [ sipTrunks,    setSipTrunks    ] = useState([]);
  const [ sipTrunkSid,  setSipTrunkSid  ] = useState('');
  const [ showLoader,   setShowLoader   ] = useState(true);
  const [ errorMessage, setErrorMessage ] = useState('');

  useEffect(() => {
    const getAPIData = async () => {
      if (!localStorage.getItem('token')) {
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'You must log in to view that page.',
        });
        return;
      }
      try {
        const sipTrunksPromise = axios({
          method: 'get',
          baseURL: process.env.REACT_APP_API_BASE_URL,
          url: `/VoipCarriers`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const sipGatewaysPromise = axios({
          method: 'get',
          baseURL: process.env.REACT_APP_API_BASE_URL,
          url: `/SipGateways`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const promiseAllValues = await Promise.all([
          sipTrunksPromise,
          sipGatewaysPromise,
        ]);

        const allSipTrunks   = promiseAllValues[0].data;
        const allSipGateways = promiseAllValues[1].data;

        setSipTrunks(allSipTrunks);

        if (props.type === 'setup' && allSipTrunks.length > 1) {
          history.push('/internal/sip-trunks');
          dispatch({
            type: 'ADD',
            level: 'error',
            message: 'That page is only accessible during setup.',
          });
        }

        if (props.type === 'edit' || props.type === 'setup') {
          const currentSipTrunk = props.type === 'edit'
            ? allSipTrunks.filter(s => s.voip_carrier_sid === props.voip_carrier_sid)
            : allSipTrunks;

          if (props.type === 'edit' && !currentSipTrunk.length) {
            history.push('/internal/sip-trunks');
            dispatch({
              type: 'ADD',
              level: 'error',
              message: 'That SIP trunk does not exist.',
            });
            return;
          }

          const currentSipGateways = allSipGateways.filter(s => {
            return s.voip_carrier_sid === currentSipTrunk[0].voip_carrier_sid;
          });
          sortSipGateways(currentSipGateways);

          if (currentSipTrunk.length) {
            setName(currentSipTrunk[0].name);
            setDescription(currentSipTrunk[0].description);
            setSipGateways(currentSipGateways.map(s => ({
              sip_gateway_sid: s.sip_gateway_sid,
              ip: s.ipv4,
              port: s.port,
              inbound: s.inbound === 1,
              outbound: s.outbound === 1,
              invalidIp: false,
              invalidPort: false,
              invalidInbound: false,
              invalidOutbound: false,
            })));
            setSipTrunkSid(currentSipTrunk[0].voip_carrier_sid);
          }
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
          setErrorMessage('Something went wrong, please try again.');
          dispatch({
            type: 'ADD',
            level: 'error',
            message: (err.response && err.response.data && err.response.data.msg) || 'Unable to get accounts',
          });
          console.log(err.response || err);
        }
        setShowLoader(false);
      }
    };
    getAPIData();
    // eslint-disable-next-line
  }, []);

  const addSipGateway = () => {
    const newSipGateways = [
      ...sipGateways,
      {
        sip_gateway_sid: '',
        ip: '',
        port: 5060,
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

  const handleSubmit = async e => {
    let isMounted = true;
    try {
      setShowLoader(true);
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
        const type = regIp.test(gateway.ip.trim())
          ? 'ip'
          : regFqdn.test(gateway.ip.trim())
            ? 'fqdn'
            : regFqdnTopLevel.test(gateway.ip.trim())
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
            !(regPort.test(gateway.port.toString().trim()))
            || (parseInt(gateway.port.toString().trim()) < 0)
            || (parseInt(gateway.port.toString().trim()) > 65535)
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
            errorMessages.push('Each SIP gateway must have a unique IP address.');
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

      //=============================================================================
      // Submit
      //=============================================================================
      const creatingNewTrunk = props.type === 'add' || (props.type === 'setup' && !sipTrunks.length);

      const method = creatingNewTrunk
        ? 'post'
        : 'put';


      const url = creatingNewTrunk
        ? '/VoipCarriers'
        : `/VoipCarriers/${sipTrunkSid}`;

      // Create or update SIP Trunk / VoIP Carrier
      const voipCarrier = await axios({
        method,
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        data: {
          name: name.trim(),
          description: description.trim(),
        },
      });
      const voip_carrier_sid = voipCarrier.data.sid;

      // get updated gateway info from API in order to delete ones that user has removed from UI
      let sipGatewaysFromAPI;
      if (!creatingNewTrunk) {
        const results = await axios({
          method: 'get',
          baseURL: process.env.REACT_APP_API_BASE_URL,
          url: '/SipGateways',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        sipGatewaysFromAPI = results.data.filter(s => s.voip_carrier_sid === sipTrunkSid);
      }

      //-----------------------------------------------------------------------------
      // Create or Update SIP Gateways
      //-----------------------------------------------------------------------------
      // Keeping track of created SIP gateways in case one throws an error, then all
      // of the ones created before that (as well as the sip trunk) have to be deleted.
      let completedSipGateways = [];
      try {
        for (const s of sipGateways) {
          const creatingNewGateway = creatingNewTrunk || s.sip_gateway_sid === '';

          const method = creatingNewGateway
            ? 'post'
            : 'put';

          const url = creatingNewGateway
            ? '/SipGateways'
            : `/SipGateways/${s.sip_gateway_sid}`;

          const data = {
            ipv4: s.ip.trim(),
            port: s.port.toString().trim(),
            inbound: s.inbound,
            outbound: s.outbound,
          };

          if (creatingNewGateway) {
            data.voip_carrier_sid = voip_carrier_sid || sipTrunkSid;
          }

          const result = await axios({
            method,
            baseURL: process.env.REACT_APP_API_BASE_URL,
            url,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            data,
          });
          if (creatingNewGateway) {
            completedSipGateways.push(result.data.sid);
          }
        };
      } catch (err) {
        if (completedSipGateways.length) {
          for (const sid of completedSipGateways) {
            await axios({
              method: 'delete',
              baseURL: process.env.REACT_APP_API_BASE_URL,
              url: `/SipGateways/${sid}`,
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            });
          }
        }
        if (voip_carrier_sid) {
          await axios({
            method: 'delete',
            baseURL: process.env.REACT_APP_API_BASE_URL,
            url: `/VoipCarriers/${voip_carrier_sid}`,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
        }
        throw err;
      }

      // delete removed gateways (after add/update in case add/update caused errors)
      if (!creatingNewTrunk) {
        for (const remote of sipGatewaysFromAPI) {
          const match = sipGateways.filter(local => local.sip_gateway_sid === remote.sip_gateway_sid);
          if (!match.length) {
            await axios({
              method: 'delete',
              baseURL: process.env.REACT_APP_API_BASE_URL,
              url: `/SipGateways/${remote.sip_gateway_sid}`,
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            });
          }
        }
      }

      if (props.type === 'setup') {
        isMounted = false;
        history.push('/setup-complete');
      } else {
        isMounted = false;
        history.push('/internal/sip-trunks');
        const dispatchMessage = props.type === 'add'
          ? 'SIP trunk created successfully'
          : 'SIP trunk updated successfully';
        dispatch({
          type: 'ADD',
          level: 'success',
          message: dispatchMessage
        });
      }

    } catch(err) {
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
      ? <Loader height={props.type === 'setup' ? '424px' : '376px'}/>
      : <Form
          large
          onSubmit={handleSubmit}
        >
          <Label htmlFor="name">Name</Label>
          <Input
            large={props.type === 'setup'}
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
            large={props.type === 'setup'}
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
                  large={props.type === 'setup'}
                  name={`sipGatewaysIp[${i}]`}
                  id={`sipGatewaysIp[${i}]`}
                  value={sipGateways[i].ip}
                  onChange={e => updateSipGateways(e, i, 'ip')}
                  placeholder={'1.2.3.4'}
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
                  large={props.type === 'setup'}
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
                  large={props.type === 'setup'}
                  id={`inbound[${i}]`}
                  label="Inbound"
                  tooltip="Sends us calls"
                  checked={sipGateways[i].inbound}
                  onChange={e => updateSipGateways(e, i, 'inbound')}
                  invalid={sipGateways[i].invalidInbound}
                  ref={ref => refInbound.current[i] = ref}
                />
                <Checkbox
                  large={props.type === 'setup'}
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

          <InputGroup flexEnd spaced>
            {props.type === 'edit' && (
              <Button
                grid
                gray
                type="button"
                onClick={() => {
                  history.push('/internal/sip-trunks');
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
              large={props.type === 'setup'}
              grid
              fullWidth={props.type === 'setup' || props.type === 'add'}
            >
              {props.type === 'setup'
                ? 'Save and Continue'
                : props.type === 'add'
                  ? 'Add SIP Trunk'
                  : 'Save'
              }
            </Button>
          </InputGroup>
        </Form>
  );
};

export default SipTrunkForm;
