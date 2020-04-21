import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { NotificationProvider } from './contexts/NotificationContext';
import { ModalProvider } from './contexts/ModalContext';
import App from './App';

ReactDOM.render(
  <NotificationProvider>
    <ModalProvider>
      <App />
    </ModalProvider>
  </NotificationProvider>,
  document.getElementById('root')
);
