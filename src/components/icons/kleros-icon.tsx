import { ComponentProps } from 'react';

export default function KlerosIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width={30} height={27} viewBox="0 0 30 27" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.7 2.162 2.146 11.6 7.44 24.207l-.256-11.5.256 11.5L20.542 25l7.46-10.607-9.335 6.883L28 14.393 22.672 2.74 9.7 2.162Zm10.207 3.509 1.338-2.448-7.638-.31 6.3 2.758Zm-9.254-2.077 7.498 3.232-9.076 3.561 1.578-6.793Zm-.8 9.389 8.022 6.204 1.36-10.307-9.382 4.102Zm6.397 7.763L8.1 14.925l.198 7.888 7.952-2.067ZM21.079 8.73l5.552 5.638-7.018 5.204L21.08 8.73ZM11.287 23.81l6.873-1.795 1.21 2.314-8.083-.519Zm8.243-2.4 6.016-4.486-4.82 6.822-1.196-2.336ZM22.7 4.371l3.18 6.823-4.348-4.423 1.168-2.4Zm-14.07-.038L6.858 11.85 3.28 11.09l5.35-6.758ZM6.797 21.25l-.157-8.077-3.593-.761 3.75 8.838Z"
        fill="currentColor"
      />
    </svg>
  );
}