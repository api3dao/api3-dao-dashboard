import { ComponentProps } from 'react';

export const CheckCircleIcon = (props: ComponentProps<'svg'>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" {...props}>
      <circle cx="6.99992" cy="7.00065" r="6.16667" stroke="currentColor" />
      <path
        d="M10.3428 4.73047L5.8053 9.26797L4 7.46267"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
