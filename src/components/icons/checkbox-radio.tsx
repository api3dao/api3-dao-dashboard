import { ComponentProps } from 'react';

interface Props extends ComponentProps<'svg'> {
  theme?: 'dark' | 'light';
}

export const CheckboxRadioIcon = ({ theme = 'light', ...props }: Props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <g clipPath="url(#clip0_10054_89269)">
        <path
          d="M19.375 10C19.375 15.1777 15.1777 19.375 10 19.375C4.82233 19.375 0.625 15.1777 0.625 10C0.625 4.82233 4.82233 0.625 10 0.625C15.1777 0.625 19.375 4.82233 19.375 10Z"
          fill={theme === 'light' ? '#F8FAFD' : '#0C1143'}
          stroke={theme === 'light' ? '#99A0E4' : '#D1D5FD'}
          stroke-width="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_10054_89269">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
