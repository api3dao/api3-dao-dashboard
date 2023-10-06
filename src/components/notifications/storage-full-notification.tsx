import { useState } from 'react';
import { closeAll } from './notifications';
import { ERROR_REPORTING_CONSENT_KEY_NAME } from '../../utils';
import styles from './storage-full-notification.module.scss';

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
            const errorReportingValue = window.localStorage.getItem(ERROR_REPORTING_CONSENT_KEY_NAME);
            window.localStorage.clear();
            if (errorReportingValue) {
              window.localStorage.setItem(ERROR_REPORTING_CONSENT_KEY_NAME, errorReportingValue);
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
