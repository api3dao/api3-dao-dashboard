import { ReactNode, useState } from 'react';
import './tooltip.scss';

type Props = {
  children: ReactNode;
  content: string | ReactNode;
};

const Tooltip = ({ children, content }: Props) => {
  const [hover, setHover] = useState(false);

  return (
    <>
      <span className="tooltip-wrapper" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        {children}
        {hover && <div className="tooltip">{content}</div>}
      </span>
    </>
  );
};

export default Tooltip;
