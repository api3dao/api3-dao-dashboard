import { ReactNode } from 'react';
import classNames from 'classnames';
import './bordered-box.scss';

type Props = {
  header: ReactNode;
  content: ReactNode | ReactNode[];
  footer?: ReactNode;
  borderColor?: 'green' | 'grey';
};

const BorderedBox = ({ header, content, footer, borderColor = 'grey' }: Props) => {
  return (
    <div className={classNames('bordered-box', borderColor)}>
      <div className="bordered-box-col _left" />
      <div className={classNames('bordered-box-innerWrap', { [`_borderBottom`]: !footer })}>
        {header}
        {content}
        {footer && <div className="bordered-box-footer">{footer}</div>}
      </div>
      <div className="bordered-box-col _right" />
    </div>
  );
};

export default BorderedBox;
