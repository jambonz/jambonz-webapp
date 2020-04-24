import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { NotificationDispatchContext } from '../../contexts/NotificationContext';

const Sbcs = () => {
  let history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);
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
          url: '/Sbcs',
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

  return (
    <div style={{ margin: '1rem 0 1.5rem' }}>
      Have your SIP trunking provider(s) send calls to
      {sbcs.length > 1
        ? <React.Fragment>
            {':'}
            <ul>
              {sbcs.map(sbc => (
                <li key={sbc.sbc_address_sid}>
                  {`${sbc.ipv4}:${sbc.port}`}
                </li>
              ))}
            </ul>
          </React.Fragment>
        : sbcs.length === 1
          ? ` ${sbcs[0].ipv4}:${sbcs[0].port}`
          : null
      }
    </div>
  );
};

export default Sbcs;
