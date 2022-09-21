import { ComponentProps } from 'react';

export default function ExternalLinkIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M15 15H5V5M7.845 12.157l6.678-6.68M10.113 5.477h4.41v4.412" stroke="currentColor" />
    </svg>
  );
}
