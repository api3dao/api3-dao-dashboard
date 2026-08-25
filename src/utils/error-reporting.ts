import * as Sentry from '@sentry/react';

let initialised = false;
export const initSentry = () => {
  if (initialised || !import.meta.env.VITE_SENTRY_DSN) return;

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_NODE_ENV,
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
