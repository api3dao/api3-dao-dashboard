import { ReactNode } from 'react';
import './bordered-box.scss';

type Props = {
  header: ReactNode;
  content: ReactNode | ReactNode[];
  footer: ReactNode;
};

const BorderedBoxes = ({ header, content, footer }: Props) => {
  return (
    <div className="bordered-box">
      <div className="bordered-box-col _left" />
      <div className="bordered-box-content">
        <div className="bordered-box-header">{header}</div>
        {content}
        <div className="bordered-box-footer">{footer}</div>
      </div>
      <div className="bordered-box-col _right" />
    </div>
  );
};

export default BorderedBoxes;
