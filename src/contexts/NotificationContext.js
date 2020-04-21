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

  const interceptDispatch = action => {
    if (action.type === 'ADD') {
      const id = Date.now();
      const actionWithId = { ...action, id };
      dispatch(actionWithId);
      setTimeout(() => {
        dispatch({ type: 'REMOVE', id });
      }, 3000);
      return;
    }
    dispatch(action);
  };

  return (
    <NotificationStateContext.Provider value={state}>
      <NotificationDispatchContext.Provider value={interceptDispatch}>
        {props.children}
      </NotificationDispatchContext.Provider>
    </NotificationStateContext.Provider>
  );
}
