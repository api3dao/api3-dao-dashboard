import { ComponentProps } from 'react';

export const ErrorCircleIcon = (props: ComponentProps<'svg'>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" {...props}>
      <circle cx="6.99992" cy="7.00065" r="6.16667" stroke="#99A0E4" />
      <path
        d="M5 5.00098L9 9.00098M9 5.00098L5 9.00098"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
