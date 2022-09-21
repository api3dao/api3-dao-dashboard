import { ComponentProps } from 'react';

const DashboardIcon = (props: ComponentProps<'svg'>) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M3.04166 14.425V3.04169H14.425V14.425H3.04166Z"
      stroke="currentColor"
      strokeWidth="0.75"
      strokeMiterlimit="10"
    />
    <path
      d="M17.575 14.425V3.04169H28.9583V14.425H17.575Z"
      stroke="currentColor"
      strokeWidth="0.75"
      strokeMiterlimit="10"
    />
    <path
      d="M3.04166 28.9583V17.575H14.425V28.9583H3.04166Z"
      stroke="currentColor"
      strokeWidth="0.75"
      strokeMiterlimit="10"
    />
    <path
      d="M17.575 28.9583V17.575H28.9583V28.9583H17.575Z"
      stroke="currentColor"
      strokeWidth="0.75"
      strokeMiterlimit="10"
    />
  </svg>
);

export default DashboardIcon;
