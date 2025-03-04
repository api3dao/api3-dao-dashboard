import { ReactElement } from 'react';
import RCTooltip from 'rc-tooltip';
import { useWindowDimensions } from '../../hooks/use-window-dimensions';
import classNames from 'classnames';
import styles from './tooltip.module.scss'; // Additional styles that require access to CSS variables

import 'rc-tooltip/assets/bootstrap_white.css'; // NOTE: This is required for basic tooltip styling
import './bootstrap_white.css'; // Override basic tooltip styling

type Props = {
  children: ReactElement;
  overlay: ReactElement | string;
  type?: 'default' | 'items' | 'full';
};

const Tooltip = ({ children, overlay, type = 'default' }: Props) => {
  // NOTE: rc-tooltip requires us to override default styles directly using objects
  // https://github.com/react-component/tooltip#props
  const overlayInnerStyle = {
    display: 'flex',
    alignItems: 'center',
    background: '#0C1143',
  };

  const { isMobile } = useWindowDimensions();

  // NOTE: rc-tooltip can be debugged by setting a 'visible' (boolean) prop
  return (
    <RCTooltip
      overlay={<div className={styles.overlayWrapper}>{overlay}</div>}
      placement="bottomRight"
      overlayClassName={classNames([styles[`${type}TooltipType`]])}
      overlayInnerStyle={overlayInnerStyle}
      mouseEnterDelay={0.2}
      align={{ offset: isMobile ? [4, 6] : [18, 6] }}
    >
      {children}
    </RCTooltip>
  );
};

export default Tooltip;
