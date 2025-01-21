import { ComponentProps } from 'react';

export const ExternalLinkIcon = (props: ComponentProps<'svg'>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 12H4V4" stroke="currentColor" />
      <path d="M6.27734 9.72515L11.6202 4.38086" stroke="currentColor" />
      <path d="M8.08984 4.38086H11.6182V7.91076" stroke="currentColor" />
    </svg>
  );
};
