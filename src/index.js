import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { NotificationProvider } from './contexts/NotificationContext';
import App from './App';

ReactDOM.render(
  <NotificationProvider>
    <App />
  </NotificationProvider>,
  document.getElementById('root')
);
