import { ComponentProps } from 'react';

export default function PoliciesIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width={32} height={32} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M6.375 3.375h19.25v25.25H6.375V3.375Z"
        stroke="currentColor"
        strokeWidth={1}
        strokeMiterlimit={10}
        shapeRendering="crispEdges"
      />
      <path d="M10 9h12M10 13h12M10 17h12" stroke="currentColor" strokeWidth={1} strokeMiterlimit={10} />
    </svg>
  );
}
