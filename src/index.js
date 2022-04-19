import React from 'react';
import ReactDOM from 'react-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import { ModalProvider } from './contexts/ModalContext';
import { ShowMsTeamsProvider } from './contexts/ShowMsTeamsContext';
import { ServiceProvider } from './contexts/ServiceProviderContext';
import App from './App';

import 'antd/dist/antd.css';
import './index.css';

ReactDOM.render(
  <NotificationProvider>
    <ModalProvider>
      <ShowMsTeamsProvider>
        <ServiceProvider>
          <App />
        </ServiceProvider>
      </ShowMsTeamsProvider>
    </ModalProvider>
  </NotificationProvider>,
  document.getElementById('root')
);
