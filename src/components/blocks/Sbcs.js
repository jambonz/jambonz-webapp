import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Sbcs = () => {
  const [ sbcs, setSbcs ] = useState('');
  useEffect(() => {
    const getAPIData = async () => {
      const sbcResults = await axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: '/Sbcs',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSbcs(sbcResults.data);
    };
    getAPIData();
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
