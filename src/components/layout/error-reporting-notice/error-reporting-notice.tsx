import { useRef, useState } from 'react';
import { ERROR_REPORTING_CONSENT_KEY_NAME, images, isErrorReportingAllowed } from '../../../utils';
import Button from '../../button/button';
import ExternalLink from '../../external-link';
import styles from './error-reporting-notice.module.scss';

interface WelcomeModalContentProps {
  onClose: () => void;
}

const ErrorReportingNotice = (props: WelcomeModalContentProps) => {
  const { onClose } = props;
  const defaultReportingValue = localStorage.getItem(ERROR_REPORTING_CONSENT_KEY_NAME);
  const [errorReportingEnabled, setErrorReportingEnabled] = useState(
    defaultReportingValue === null || isErrorReportingAllowed(defaultReportingValue)
  );
  const onErrorReportingNoticeConfirm = () => {
    localStorage.setItem(ERROR_REPORTING_CONSENT_KEY_NAME, errorReportingEnabled.toString());
    onClose();
  };
  const errorReportingRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div id="error-reporting" className={styles.wrapper} ref={errorReportingRef}>
        <div className={styles.gradient}></div>
        <img
          className={styles.closeButton}
          onClick={onErrorReportingNoticeConfirm}
          src={images.close}
          alt="confirm and close icon"
        />
        <div className={styles.content}>
          <div className={styles.notice}>
            In order to provide the best services for you, we collect anonymized error data through{' '}
            <b>
              <ExternalLink href="https://sentry.io/">Sentry</ExternalLink>
            </b>
            . We do not gather IP address or user agent information.
          </div>
          <div className={styles.checkboxWrapper}>
            <input
              type="checkbox"
              id="errorReporting"
              name="errorReporting"
              checked={errorReportingEnabled}
              onChange={(e) => setErrorReportingEnabled(e.target.checked)}
            />
            <label htmlFor="errorReporting">Allow error reporting</label>
          </div>
          <Button type="secondary" onClick={onErrorReportingNoticeConfirm}>
            Done
          </Button>
        </div>
      </div>
    </>
  );
};

export default ErrorReportingNotice;
