import React, { createContext, useReducer } from 'react';
import NotificationReducer from '../reducers/NotificationReducer';

export const NotificationStateContext = createContext();
export const NotificationDispatchContext = createContext();

export function NotificationProvider(props) {

  /*
  sample notification format
  {
    id: 1234,
    level: 'info',
    message: 'hello',
  };
  */

  const [state, dispatch] = useReducer(NotificationReducer, []);

  return (
    <NotificationStateContext.Provider value={state}>
      <NotificationDispatchContext.Provider value={dispatch}>
        {props.children}
      </NotificationDispatchContext.Provider>
    </NotificationStateContext.Provider>
  );
}