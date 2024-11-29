import * as Sentry from '@sentry/react';

let initialised = false;
export const initSentry = () => {
  if (initialised) return;

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

  initialised = true;
};
