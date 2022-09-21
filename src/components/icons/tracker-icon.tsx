import { ComponentProps } from 'react';

export default function TrackerIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width={32} height={32} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <ellipse
        cx={15.635}
        cy={15.639}
        rx={11.005}
        ry={11.007}
        stroke="currentColor"
        strokeWidth={0.75}
        strokeMiterlimit={10}
      />
      <ellipse
        cx={15.635}
        cy={15.635}
        rx={3.001}
        ry={3.002}
        stroke="currentColor"
        strokeWidth={0.75}
        strokeMiterlimit={10}
      />
      <path
        d="M15.638 7.359v-4.73M15.638 29.37v-4.73M7.36 15.633H2.63M29.371 15.633h-4.73"
        stroke="currentColor"
        strokeWidth={0.75}
        strokeMiterlimit={10}
      />
    </svg>
  );
}
