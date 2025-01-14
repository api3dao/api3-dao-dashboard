import { useState } from 'react';
import { ALLOW_ANALYTICS, ALLOW_ERROR_REPORTING } from '../../utils/analytics';
import styles from './notifications.module.scss';
import Button from '../button';

export const ClearStorageButton = () => {
  const [isClearing, setIsClearing] = useState(false);

  const clearStorage = () => {
    setIsClearing(true);

    // Store the current values of the analytics and error reporting settings
    const errorReportingValue = window.localStorage.getItem(ALLOW_ERROR_REPORTING);
    const analyticsValue = window.localStorage.getItem(ALLOW_ANALYTICS);

    window.localStorage.clear();

    // Restore the previous values of the analytics and error reporting settings
    if (errorReportingValue) {
      window.localStorage.setItem(ALLOW_ERROR_REPORTING, errorReportingValue);
    }
    if (analyticsValue) {
      window.localStorage.setItem(ALLOW_ANALYTICS, analyticsValue);
    }

    window.location.reload();
  };

  return (
    <div className={styles.transactionButtonContainer}>
      <Button type="primary" size="xs" disabled={isClearing} onClick={clearStorage}>
        <span>{isClearing ? 'Clearing...' : 'Clear Storage'}</span>
      </Button>
    </div>
  );
};
