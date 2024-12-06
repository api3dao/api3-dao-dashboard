import { ComponentProps } from 'react';

export const RadioButtonFillIcon = (props: ComponentProps<'svg'>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="27" height="28" viewBox="0 0 27 28" fill="none" {...props}>
      <circle cx="13.5" cy="14" r="13" stroke="currentColor" />
      <circle cx="13.5" cy="14" r="7.5" fill="currentColor" />
    </svg>
  );
};
