import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import './index.scss';
import App from './app';

if (process.env.REACT_APP_SENTRY_DSN && process.env.REACT_APP_NODE_ENV) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.REACT_APP_NODE_ENV,
    integrations(integrations) {
      return integrations.filter((integration) => {
        // Integrations can be filtered out here
        // See: https://docs.sentry.io/platforms/javascript/configuration/integrations/default/
        return !['UserAgent'].includes(integration.name);
      });
    },
    beforeSend(event) {
      // Do not collect the user's IP address
      event.user = { ip_address: '0.0.0.0' };
      return event;
    },
  });
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
