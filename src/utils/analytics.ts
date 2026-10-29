export const ALLOW_ERROR_REPORTING = 'allow-error-reporting';
export const ALLOW_ANALYTICS = 'allow-analytics';

export const canReportErrors = () => localStorage.getItem(ALLOW_ERROR_REPORTING) === 'true';
export const canUseAnalytics = () => localStorage.getItem(ALLOW_ANALYTICS) === 'true';

const gtmId = import.meta.env.VITE_GTM_ID || '';

let initialised = false;
export const initAnalytics = () => {
  if (initialised) return;

  if (gtmId) {
    // TODO: initialize google analytics
  }

  initialised = true;
};
