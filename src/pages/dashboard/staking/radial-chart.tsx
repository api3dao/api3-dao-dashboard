import { UNKNOWN_NUMBER } from '../../../utils';
import clamp from 'lodash/clamp';

const { round, PI, cos, sin } = Math;

type Props = {
  completionPercent: number | undefined;
};

const RadialChart = ({ completionPercent }: Props) => {
  const r = 73,
    strokeWidth = 8,
    side = r * 2 + strokeWidth * 2,
    center = r + strokeWidth;

  const completionText = completionPercent !== undefined ? `${completionPercent}%` : UNKNOWN_NUMBER;
  // Radial chart styling breaks if the value is more than 100%
  const completionValue = clamp(completionPercent ?? 0, 0, 100);

  return (
    <svg width={side} height={side}>
      <circle cx={center} cy={center} r={r} stroke="#D1D5FD" strokeWidth={5} fill="none" />

      <path
        stroke="url(#gradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        d={describeArc(center, center, r, 0, completionValue === 100 ? 359 : round((completionValue / 100) * 360))}
      />

      <text
        x="50%"
        y="45%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#1F267B"
        fontSize={32}
        fontWeight={500}
        children={completionText}
      />

      <text
        x="50%"
        y="62%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#455065"
        fontSize={12}
        fontWeight={600}
        children="OF TARGET MET"
      />

      <defs>
        <linearGradient id="gradient" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#1B39FF" />
          <stop offset="100%" stopColor="#1B39FF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default RadialChart;

/* Following functions copied from:
 * https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle */
const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle),
    end = polarToCartesian(x, y, radius, startAngle),
    largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
};

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * PI) / 180.0;

  return {
    x: centerX + radius * cos(angleInRadians),
    y: centerY + radius * sin(angleInRadians),
  };
};
