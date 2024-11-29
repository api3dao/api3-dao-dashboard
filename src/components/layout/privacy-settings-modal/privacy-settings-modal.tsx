import { useState } from 'react';
import { ALLOW_ANALYTICS, ALLOW_ERROR_REPORTING } from '../../../utils/analytics';
import { Modal, ModalFooter, ModalHeader } from '../../modal';
import styles from './privacy-settings-modal.module.scss';
import Button from '../../button';
import CheckBox from '../../checkbox';
import { links } from '../../../utils/links';
import classNames from 'classnames';
import ExternalLink from '../../external-link';
import { images } from '../../../utils';

interface Props {
  open: boolean;
  onCancel: () => void;
  onSubmit: (allowAnalytics: boolean, allowReporting: boolean) => void;
}

const PrivacySettingsModal = (props: Props) => {
  const { open, onCancel, onSubmit } = props;

  const storedErrorReportingFlag = localStorage.getItem(ALLOW_ERROR_REPORTING);
  const storedAnalyticsFlag = localStorage.getItem(ALLOW_ANALYTICS);

  const [allowReporting, setAllowReporting] = useState(() => storedErrorReportingFlag === 'true');
  const [allowAnalytics, setAllowAnalytics] = useState(() => storedAnalyticsFlag === 'true');

  return (
    <Modal open={open} onClose={onCancel}>
      <ModalHeader>Privacy Settings</ModalHeader>

      <div className={styles.privacySettingsModalContent}>
        <div className={styles.privacyDescription}>
          <span>
            In order to provide the best services for you, we collect anonymized error data through Sentry and use
            analytics cookies to improve our products. We do not gather IP address or user agent information.{' '}
          </span>
          <ExternalLink className={styles.privacyPolicyButton} href={links.PRIVACY_POLICY}>
            Visit our Privacy Policy
          </ExternalLink>
          <img src={images.externalLink} alt="" className={styles.externalLinkIcon} />
        </div>

        <div className={styles.checkboxes}>
          <div className={classNames(styles.checkboxContainer, { selected: allowReporting })}>
            <CheckBox checked={allowReporting} onChange={setAllowReporting} label="Allow error reporting">
              <div className={styles.sentryButton}>
                <ExternalLink href={links.SENTRY}>Sentry</ExternalLink>{' '}
                <img src={images.externalLink} alt="" className={styles.externalLinkIcon} />
              </div>
              collects error data to improve the performance and reliability of our services, and helps us identify and
              fix issues quickly, ensuring a smoother experience for you.
            </CheckBox>
          </div>

          <div className={classNames(styles.checkboxContainer, { selected: allowAnalytics })}>
            <CheckBox checked={allowAnalytics} onChange={setAllowAnalytics} label="Allow analytics cookies">
              Analytics cookies help us to improve our website by collecting and reporting information on how you use
              it.
            </CheckBox>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button
          className={styles.saveSettingsButton}
          type="primary"
          sm={{ size: 'lg' }}
          onClick={() => onSubmit(allowAnalytics, allowReporting)}
        >
          Save Settings
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default PrivacySettingsModal;
