import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { NotificationProvider } from './contexts/NotificationContext';
import { ModalProvider } from './contexts/ModalContext';
import { ShowMsTeamsProvider } from './contexts/ShowMsTeamsContext';
import App from './App';

ReactDOM.render(
  <NotificationProvider>
    <ModalProvider>
      <ShowMsTeamsProvider>
        <App />
      </ShowMsTeamsProvider>
    </ModalProvider>
  </NotificationProvider>,
  document.getElementById('root')
);
