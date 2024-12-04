// import TagManager from 'react-gtm-module';

export const ALLOW_ERROR_REPORTING = 'allow-error-reporting';
export const ALLOW_ANALYTICS = 'allow-analytics';

export const canReportErrors = () => localStorage.getItem(ALLOW_ERROR_REPORTING) === 'true';
export const canUseAnalytics = () => localStorage.getItem(ALLOW_ANALYTICS) === 'true';

const gtmId = process.env.VITE_APP_GTM_ID || '';

// const tagManagerArgs = {
//   gtmId,
// };

let initialised = false;
export const initAnalytics = () => {
  if (initialised) return;

  if (gtmId) {
    // TagManager.initialize(tagManagerArgs); // TBD later
  }

  initialised = true;
};
