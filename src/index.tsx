import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import './index.scss';
import App from './app';

if (process.env.REACT_APP_SENTRY_DSN && process.env.REACT_APP_ENVIRONMENT) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.REACT_APP_ENVIRONMENT,
  });
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
