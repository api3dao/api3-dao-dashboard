import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './index.scss';
import App from './app';
import { mockLocalhostWeb3Provider } from './chain-data';
import { ERROR_REPORTING_CONSENT_KEY_NAME, isErrorReportingAllowed } from './utils';

const errorReportingValue = localStorage.getItem(ERROR_REPORTING_CONSENT_KEY_NAME);
if (isErrorReportingAllowed(errorReportingValue) && process.env.REACT_APP_SENTRY_DSN) {
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

if (process.env.REACT_APP_NODE_ENV === 'development' && (window as any).ethereum === undefined) {
  mockLocalhostWeb3Provider(window);
}

const root = createRoot(document.getElementById('root')!);

// NOTE: Strict mode triggers useEffect and useMemo hooks twice on mount (in development), which results
// in our data hooks triggering 3 times on mount (the third trigger is caused by the memoized smart contracts
// which are included in the useEffect dependency arrays). Because of this, we have decided to turn off strict mode.
root.render(<App />);
