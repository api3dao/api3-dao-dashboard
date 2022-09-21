import { ComponentProps } from 'react';
import ArrowLeftIcon from './arrow-left-icon';

export default function ArrowRightIcon(props: ComponentProps<'svg'>) {
  return <ArrowLeftIcon {...props} style={{ ...props.style, transform: 'rotate(180deg)' }} />;
}
