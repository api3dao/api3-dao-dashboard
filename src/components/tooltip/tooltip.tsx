import { ReactElement } from 'react';
import RCTooltip from 'rc-tooltip';
// Additional styles that require access to CSS variables
import styles from './tooltip.module.scss';
// NOTE: This is required for basic tooltip styling
import 'rc-tooltip/assets/bootstrap_white.css';

type Props = {
  children: ReactElement;
  overlay: ReactElement | string;
};

const Tooltip = ({ children, overlay }: Props) => {
  // NOTE: rc-tooltip requires us to override default styles directly using objects
  // https://github.com/react-component/tooltip#props
  const overlayInnerStyle = {
    alignItems: 'center',
    background: 'linear-gradient(76.31deg, #f3f3f3 36.47%, #c3c4c3 99.02%)',
    display: 'flex',
  };

  // NOTE: rc-tooltip can be debugged by setting a 'visible' (boolean) prop
  return (
    <RCTooltip
      overlay={<div className={styles.overlayWrapper}>{overlay}</div>}
      placement="bottom"
      overlayClassName={styles.tooltip}
      overlayInnerStyle={overlayInnerStyle}
      mouseEnterDelay={0.2}
    >
      {children}
    </RCTooltip>
  );
};

export default Tooltip;
