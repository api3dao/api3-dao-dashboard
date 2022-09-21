import { ComponentProps } from 'react';

const HistoryIcon = (props: ComponentProps<'svg'>) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip1)">
      <path
        d="M17.4375 30.0977C25.1375 30.0977 31.4375 23.7977 31.4375 16.0977C31.4375 8.39766 25.1375 2.09766 17.4375 2.09766C9.7375 2.09766 3.4375 8.39766 3.4375 16.0977"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
      <path
        d="M5.73711 14.2979L3.33711 16.2979L1.53711 13.7979"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.7375 19.3977L17.4375 16.2977V9.09766"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
    </g>
    <defs>
      <clipPath id="clip0">
        <rect width="32" height="32" fill="white" transform="translate(0.0371094 0.597656)" />
      </clipPath>
      <clipPath id="clip1">
        <rect width="30.9" height="29" fill="white" transform="translate(1.03711 1.59766)" />
      </clipPath>
    </defs>
  </svg>
);

export default HistoryIcon;
