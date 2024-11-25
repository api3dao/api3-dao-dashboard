import { ComponentProps } from 'react';

export const InfoCircleIcon = (props: ComponentProps<'svg'>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="8.00065" cy="7.99967" r="6.16667" stroke="currentColor" />
      <path d="M7 7H8.0038L8.0038 11H9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7.90078" cy="5.1" r="0.6" fill="currentColor" />
    </svg>
  );
};
