import classNames from 'classnames';
import { useState } from 'react';
import Link from './components/link';
import { Modal, ModalHeader } from './components/modal/modal';
import { ERROR_REPORTING_CONSENT_KEY_NAME } from './utils';
import styles from './welcome-modal.module.scss';

interface WelcomeModalContentProps {
  setErrorReportingEnabled: (value: boolean) => void;
  errorReportingEnabled: boolean;
}

const WelcomeModalContent = (props: WelcomeModalContentProps) => {
  const { errorReportingEnabled, setErrorReportingEnabled } = props;

  return (
    <>
      <ModalHeader>Hello and welcome :)</ModalHeader>

      <div>
        <p>
          We want to inform you, that we are gathering anonymized error reports for improving our services and for this
          we use <Link href="https://sentry.io/">Sentry</Link>. You can find out what information exactly will Sentry
          gather <Link href="https://www.sentryworld.com/privacy-policy">here</Link>.
        </p>

        <p className={styles.smallSpace}>
          In case you are against this, you can opt out from error reporting using the checkbox below.
        </p>

        <div className={classNames(styles.checkboxWrapper, styles.smallSpace)}>
          <input
            type="checkbox"
            id="errorReporting"
            name="errorReporting"
            checked={errorReportingEnabled}
            onChange={(e) => setErrorReportingEnabled(e.target.checked)}
          />
          <label htmlFor="errorReporting">Enable error reporting</label>
        </div>

        <p>
          In case you have any feedback or bug report, tell us by using any of the following:
          <ul>
            <li>
              <Link href="https://github.com/api3dao/api3-dao-dashboard/issues" className={styles.link}>
                Github issue
              </Link>
            </li>
            <li>
              <Link href="https://discord.com/invite/qnRrcfnm5W" className={styles.link}>
                Discord
              </Link>
            </li>
            <li>
              <Link href="https://t.me/API3DAO" className={styles.link}>
                Telegram
              </Link>
            </li>
          </ul>
          For more information visit{' '}
          <Link href="https://api3.org/" className={styles.link}>
            API3 website
          </Link>
        </p>
      </div>
    </>
  );
};

const WelcomeModal = () => {
  const [open, setOpen] = useState(localStorage.getItem(ERROR_REPORTING_CONSENT_KEY_NAME) === null);
  const [errorReportingEnabled, setErrorReportingEnabled] = useState(true);
  const onModalClose = () => {
    localStorage.setItem(ERROR_REPORTING_CONSENT_KEY_NAME, errorReportingEnabled.toString());
    setOpen(false);
  };

  return (
    <Modal open={open} onClose={onModalClose} closeOnAccountChange={false}>
      <WelcomeModalContent
        errorReportingEnabled={errorReportingEnabled}
        setErrorReportingEnabled={setErrorReportingEnabled}
      />
    </Modal>
  );
};

export default WelcomeModal;
