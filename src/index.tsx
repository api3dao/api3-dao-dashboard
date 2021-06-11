import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { removeKey } from './utils';
import './index.scss';
import App from './app';

if (process.env.REACT_APP_SENTRY_DSN && process.env.REACT_APP_ENVIRONMENT) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.REACT_APP_ENVIRONMENT,
    beforeSend(event) {
      // Remove any and all identifying user information
      return removeKey(event, 'user');
    },
  });
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
