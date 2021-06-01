import Button from '../../../components/button/button';
import './unstake-banner.scss';

type Props = {
  onClick?: () => void;
};

const UnstakeBanner = ({ onClick }: Props) => {
  return (
    <div className="unstake-banner">
      <div className="unstake-banner-wrap">
        <img src="/api-icon.svg" alt="api icon" />
        <div className="unstake-banner-text">
          <p className="bold">Your tokens are ready to be unstaked.</p>
          <p>Unstake within 5 days 15 hours.</p>
        </div>
      </div>
      <Button size="large" onClick={onClick}>
        Unstake
      </Button>
    </div>
  );
};

export default UnstakeBanner;
