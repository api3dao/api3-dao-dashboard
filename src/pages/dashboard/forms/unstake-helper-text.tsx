import { ExclamationTriangleFillIcon } from '../../../components/icons';
import styles from './forms.module.scss';

const messages = {
  basic: 'Once staked, you will not be able to unstake your tokens for 7 days.',
  extended:
    'Unstaked tokens will no longer grant you rewards or voting power. You will not be able to withdraw your unstaked tokens for 7 days.',
};

interface UnstakeHelperTextProps {
  type: keyof typeof messages;
}

const UnstakeHelperText = (props: UnstakeHelperTextProps) => {
  const { type } = props;

  return (
    <div className={styles.tokenAmountFormHelperText}>
      <ExclamationTriangleFillIcon />
      {messages[type]}
    </div>
  );
};

export default UnstakeHelperText;
