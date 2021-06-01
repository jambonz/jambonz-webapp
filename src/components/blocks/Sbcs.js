import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { NotificationDispatchContext } from '../../contexts/NotificationContext';
import { ServiceProviderValueContext } from '../../contexts/ServiceProviderContext';

const Container = styled.div`
  margin-top: 0.25rem;
  ${props => props.centered && `
    display: flex;
    flex-direction: column;
    align-items: center;
    & ul {
      padding: 0;
      margin-bottom: 0;
    }
  `}
`;

const Sbcs = props => {
  let history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);
  const currentServiceProvider = useContext(ServiceProviderValueContext);
  const [ sbcs, setSbcs ] = useState('');
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
        const sbcResults = await axios({
          method: 'get',
          baseURL: process.env.REACT_APP_API_BASE_URL,
          url: `/Sbcs?service_provider_sid=${currentServiceProvider}`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setSbcs(sbcResults.data);
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
      }
    };
    getAPIData();
    // eslint-disable-next-line
  }, []);

  const text = 'Have your SIP trunking provider(s) send calls to';
  return (
    sbcs.length > 1
      ? <Container centered={props.centered}>
          {text}:
          <ul>
            {sbcs.map(sbc => (
              <li key={sbc.sbc_address_sid}>
                {`${sbc.ipv4}:${sbc.port}`}
              </li>
            ))}
          </ul>
        </Container>
      : sbcs.length === 1
        ? <Container>
            {text} {sbcs[0].ipv4}:{sbcs[0].port}
          </Container>
        : null
  );
};

export default Sbcs;
