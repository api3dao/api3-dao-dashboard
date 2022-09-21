import { ComponentProps } from 'react';

export default function ClaimsIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width={33} height={32} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M13.3 30.7h16.2M13.302 16.832 2.5 27.704M16.389 1.3 9.445 8.29M29.502 14.504l-6.944 6.99"
        stroke="currentColor"
        strokeMiterlimit={10}
      />
      <path
        transform="matrix(.70478 .70943 -.70478 .70943 18.704 3.637)"
        stroke="currentColor"
        strokeMiterlimit={10}
        d="M0 0h12.041v9.852H0z"
      />
    </svg>
  );
}
