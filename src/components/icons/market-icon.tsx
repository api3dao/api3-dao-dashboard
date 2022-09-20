import { ComponentProps } from 'react';

export default function MarketIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width={32} height={32} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M30 7.5H2" stroke="currentColor" strokeWidth={0.75} strokeMiterlimit={10} />
      <path
        d="M5 10.5v-.375h-.375v.375H5Zm22 0h.375v-.375H27v.375Zm-22 14h-.375v.375H5V24.5Zm8.25 0v.375h.375V24.5h-.375Zm0-11v-.375h-.375v.375h.375Zm5.5 0h.375v-.375h-.375v.375Zm0 11h-.375v.375h.375V24.5Zm8.25 0v.375h.375V24.5H27ZM5 10.875h22v-.75H5v.75ZM5.375 24.5v-14h-.75v14h.75Zm7.875-.375H5v.75h8.25v-.75Zm.375.375v-11h-.75v11h.75Zm-.375-10.625h5.5v-.75h-5.5v.75Zm5.125-.375v11h.75v-11h-.75ZM27 24.125h-8.25v.75H27v-.75ZM26.625 10.5v14h.75v-14h-.75Z"
        fill="currentColor"
      />
    </svg>
  );
}
