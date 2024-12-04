import { useState } from 'react';
import { closeAll } from './notifications';
import styles from './storage-full-notification.module.scss';
import { ALLOW_ANALYTICS, ALLOW_ERROR_REPORTING } from '../../utils/analytics';

export default function StorageFullNotification() {
  const [busy, setBusy] = useState(false);

  return (
    <div>
      We have detected that your local storage is full. Would you like to clear it and refresh the page?
      <div className={styles.buttonRow}>
        <button onClick={() => closeAll()} className={styles.cancelButton}>
          Cancel
        </button>
        <button
          className={styles.clearButton}
          disabled={busy}
          onClick={() => {
            setBusy(true);
            const errorReportingValue = window.localStorage.getItem(ALLOW_ERROR_REPORTING);
            const analyticsValue = window.localStorage.getItem(ALLOW_ANALYTICS);
            window.localStorage.clear();
            if (errorReportingValue) {
              window.localStorage.setItem(ALLOW_ERROR_REPORTING, errorReportingValue);
            }
            if (analyticsValue) {
              window.localStorage.setItem(ALLOW_ANALYTICS, analyticsValue);
            }
            window.location.reload();
          }}
        >
          {busy ? 'Clearing...' : 'Clear Storage'}
        </button>
      </div>
    </div>
  );
}
