import { ComponentProps } from 'react';

export default function ArrowLeftIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M5.5 11.001L0.5 6.00098L5.5 1.00098"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 6.50098C12.7761 6.50098 13 6.27712 13 6.00098C13 5.72483 12.7761 5.50098 12.5 5.50098V6.50098ZM0.5 6.50098H12.5V5.50098H0.5V6.50098Z"
        fill="currentColor"
      />
    </svg>
  );
}
