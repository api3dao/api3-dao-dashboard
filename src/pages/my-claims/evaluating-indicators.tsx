import Api3Icon from '../../components/icons/api3-icon';
import KlerosIcon from '../../components/icons/kleros-icon';
import InfoIcon from '../../components/icons/info-icon';
import { Tooltip } from '../../components/tooltip';
import { useCountdown } from '../../components/timer/hooks';
import { Claim } from '../../chain-data';
import { formatDistanceToNow } from 'date-fns';
import styles from './evaluating-indicators.module.scss';

interface Props {
  claim: Claim;
  onDeadlineExceeded: () => void;
}

export function Api3EvaluatingIndicator(props: Props) {
  const { claim } = props;
  useCountdown(claim.deadline!, props.onDeadlineExceeded);

  const tooltipId = `tooltip-${claim.claimId}`;
  return (
    <span className={styles.evaluatingIndicator}>
      <Api3Icon aria-hidden />
      API3 Mediators evaluating
      <Tooltip
        id={tooltipId}
        overlay={`The API3 Mediators will respond to your claim within ${formatDistanceToNow(claim.deadline!)}.`}
      >
        <button aria-describedby={tooltipId}>
          <InfoIcon aria-hidden />
          <span className="sr-only">View info</span>
        </button>
      </Tooltip>
    </span>
  );
}

export function KlerosEvaluatingIndicator(props: Props) {
  const { claim } = props;
  const countdown = useCountdown(claim.deadline!, props.onDeadlineExceeded);

  const tooltipId = `tooltip-${claim.claimId}`;
  return (
    <span className={styles.evaluatingIndicator}>
      <KlerosIcon aria-hidden />
      Kleros evaluating
      <Tooltip
        id={tooltipId}
        overlay={
          countdown.dateDiff > 0
            ? `Kleros should respond to your claim within ${formatDistanceToNow(claim.deadline!)}.`
            : // We might end up here in the brief moment after the voting period has passed and the KlerosLiquid "passPeriod()" smart contract
              // function has not yet been called to move the dispute into its appeal period.
              'Kleros should respond to your claim soon.'
        }
      >
        <button aria-describedby={tooltipId}>
          <InfoIcon aria-hidden />
          <span className="sr-only">View info</span>
        </button>
      </Tooltip>
    </span>
  );
}
