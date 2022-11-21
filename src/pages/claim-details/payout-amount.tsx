import { format } from 'date-fns';
import { Tooltip } from '../../components/tooltip';
import { formatApi3, images } from '../../utils';
import { Claim, ClaimPayout } from '../../chain-data';
import styles from './payout-amount.module.scss';

interface Props {
  claim: Claim;
  payout: ClaimPayout;
}

export default function PayoutAmount(props: Props) {
  const { claim, payout } = props;

  const getActionDescription = () => {
    switch (claim.status) {
      case 'ClaimAccepted':
        return 'the claim was accepted';
      case 'SettlementAccepted':
        return 'the settlement was accepted';
      default:
        return 'the payout was executed';
    }
  };

  const renderTooltip = () => {
    const formattedDate = format(claim.statusUpdatedAt, 'dd MMM yyyy HH:mm');
    return (
      <p>
        The API3 amount is equivalent to the USD amount at the time {getActionDescription()} ({formattedDate})
      </p>
    );
  };

  return (
    <div className={styles.payoutAmount} data-testid="api3-payout">
      {formatApi3(payout.amountInApi3)} API3 tokens
      <Tooltip id="payout-tooltip" overlay={renderTooltip()}>
        <button aria-describedby="payout-tooltip" className={styles.helpButton}>
          <img src={images.help} aria-hidden alt="" />
          <span className="sr-only">View payout info</span>
        </button>
      </Tooltip>
    </div>
  );
}
