/* eslint-disable no-undef */
import React, { useState, createContext, useContext } from 'react';
import axios from 'axios';
import { NotificationDispatchContext } from './NotificationContext';

export const ShowMsTeamsStateContext = createContext();
export const ShowMsTeamsDispatchContext = createContext();

export function ShowMsTeamsProvider(props) {
  const dispatch = useContext(NotificationDispatchContext);
  const [ showMsTeams, setShowMsTeams ] = useState(false);

  const getMsTeamsData = async () => {
    try {
      const serviceProvidersResponse = await axios({
        method: 'get',
        baseURL: APP_API_BASE_URL,
        url: '/ServiceProviders',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (serviceProvidersResponse.data[0].ms_teams_fqdn) {
        setShowMsTeams(true);
      } else {
        setShowMsTeams(false);
      }

    } catch (err) {
      dispatch({
        type: 'ADD',
        level: 'error',
        message: (err.response && err.response.data && err.response.data.msg) || 'Something went wrong, please try again.',
      });
      console.log(err.response || err);
    }
  };

  return (
    <ShowMsTeamsStateContext.Provider value={showMsTeams}>
      <ShowMsTeamsDispatchContext.Provider value={getMsTeamsData}>
        {props.children}
      </ShowMsTeamsDispatchContext.Provider>
    </ShowMsTeamsStateContext.Provider>
  );
};
