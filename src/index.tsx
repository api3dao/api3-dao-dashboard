import { createRoot } from 'react-dom/client';
import './index.scss';
import App from './app';
import { mockLocalhostWeb3Provider } from './chain-data';
import { canReportErrors, canUseAnalytics, initAnalytics } from './utils/analytics';
import { initSentry } from './utils/error-reporting';

if (process.env.REACT_APP_NODE_ENV === 'development' && (window as any).ethereum === undefined) {
  mockLocalhostWeb3Provider(window);
}

const root = createRoot(document.getElementById('root')!);

// NOTE: Strict mode triggers useEffect and useMemo hooks twice on mount (in development), which results
// in our data hooks triggering 3 times on mount (the third trigger is caused by the memoized smart contracts
// which are included in the useEffect dependency arrays). Because of this, we have decided to turn off strict mode.
root.render(<App />);

if (canReportErrors()) {
  initSentry();
}

if (canUseAnalytics()) {
  initAnalytics();
}
