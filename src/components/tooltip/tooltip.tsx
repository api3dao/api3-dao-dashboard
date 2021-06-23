import { ReactElement } from 'react';
import RCTooltip from 'rc-tooltip';
// Additional styles that require access to CSS variables
import styles from './tooltip.module.scss';
// NOTE: This is required for basic tooltip styling
import 'rc-tooltip/assets/bootstrap_white.css';

type Props = {
  children: ReactElement;
  content: string | any;
};

const Tooltip = ({ children, content }: Props) => {
  // NOTE: rc-tooltip requires us to override default styles directly using objects
  // https://github.com/react-component/tooltip#props
  const overlayStyle = {
    opacity: '1',
  };

  const overlayInnerStyle = {
    background: 'linear-gradient(76.31deg, #f3f3f3 36.47%, #c3c4c3 99.02%)',
  };

  return (
    <RCTooltip
      overlay={content}
      placement="bottom"
      overlayClassName={styles.tooltip}
      overlayStyle={overlayStyle}
      overlayInnerStyle={overlayInnerStyle}
    >
      {children}
    </RCTooltip>
  );
};

export default Tooltip;
