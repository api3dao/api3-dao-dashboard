import { ComponentProps } from 'react';

export default function InfoIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx={10} cy={10} r={9.5} stroke="currentColor" />
      <path
        d="M9.363 14.076h1.274V7.531H9.363v6.545Zm.643-7.555c.439 0 .806-.341.806-.759 0-.417-.367-.762-.806-.762-.443 0-.805.345-.805.762 0 .418.362.759.805.759Z"
        fill="currentColor"
      />
    </svg>
  );
}
