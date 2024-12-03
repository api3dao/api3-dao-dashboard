import { useState } from 'react';
import { images } from '../../../utils';
import Button from '../../button';
import styles from './error-reporting-notice.module.scss';
import ExternalLink from '../../external-link';
import { links } from '../../../utils/links';
import { ALLOW_ANALYTICS, ALLOW_ERROR_REPORTING, initAnalytics } from '../../../utils/analytics';
import PrivacySettingsModal from '../privacy-settings-modal';
import { CrossIcon } from '../../icons';
import { initSentry } from '../../../utils/error-reporting';

interface WelcomeModalContentProps {
  onShowNotice: (showNotice: boolean) => void;
}

const ErrorReportingNotice = (props: WelcomeModalContentProps) => {
  const { onShowNotice } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (allowAnalytics: boolean, allowReporting: boolean) => {
    localStorage.setItem(ALLOW_ERROR_REPORTING, allowReporting.toString());
    localStorage.setItem(ALLOW_ANALYTICS, allowAnalytics.toString());

    if (allowAnalytics) {
      initAnalytics();
      (window as any).clarity?.('consent');
    }

    if (allowReporting) {
      initSentry();
    }

    onShowNotice(false);
    setIsModalOpen(false);
  };

  return (
    <>
      <PrivacySettingsModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onSubmit={handleSubmit} />

      <div data-cy="error-reporting" className={styles.wrapper}>
        <div className={styles.content}>
          <div className={styles.notice}>
            In order to provide the best services for you, we collect anonymized error data through{' '}
            <ExternalLink className={styles.dark} href={links.SENTRY}>
              Sentry
            </ExternalLink>
            <img src={images.externalLink} alt="" className={styles.externalLinkIcon} /> and use analytics cookies to
            improve our products.
          </div>
          <div className={styles.buttons}>
            <Button
              className={styles.manageSettingsButton}
              type="text-blue"
              size="sm"
              theme="dark"
              onClick={() => setIsModalOpen(true)}
            >
              Manage Settings
            </Button>
            <Button type="primary" size="sm" theme="dark" onClick={() => handleSubmit(true, true)}>
              Accept All
            </Button>
          </div>
        </div>

        <button className={styles.closeButton} onClick={() => onShowNotice(false)}>
          <CrossIcon />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>
  );
};

export default ErrorReportingNotice;
