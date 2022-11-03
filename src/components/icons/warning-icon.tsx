import { ComponentProps } from 'react';

export default function WarningIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M20.613 20.318H3.395a.693.693 0 0 1-.59-1.057l8.635-13.99a.693.693 0 0 1 1.18.002l8.584 13.99a.693.693 0 0 1-.59 1.055Z"
        stroke="currentColor"
        strokeWidth={1.386}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.001 17.545h.012"
        stroke="currentColor"
        strokeWidth={1.663}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.001 9.781v5.545"
        stroke="currentColor"
        strokeWidth={1.109}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
