import React, { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { NotificationDispatchContext } from '../../../contexts/NotificationContext';
import SetupTemplate from '../../templates/SetupTemplate';
import Button from '../../elements/Button';

const SetupComplete = () => {
  const history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);
  useEffect(() => {
    document.title = `Setup Complete | Jambonz | Open Source CPAAS`;
  });

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

  return (
    <SetupTemplate
      title="Setup Complete!"
      progress={4}
    >
      <Button
        large
        fullWidth
        onClick={() => {
          history.push('/internal/accounts');
        }}
      >
        Continue to account
      </Button>
    </SetupTemplate>
  );
};

export default SetupComplete;
