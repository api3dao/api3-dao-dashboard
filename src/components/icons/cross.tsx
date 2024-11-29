import { ComponentProps } from 'react';

export const CrossIcon = ({ ...props }: ComponentProps<'svg'>) => {
  return (
    <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M4.5 5L11.5 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M4.5 12.001L7.99973 8.50125L11.5 5.00098"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
